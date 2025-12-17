import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

mongoose.set('strictQuery', false)

import authRouter from './routes/auth.js'
import oauthRouter from './routes/oauth.js'
import postsRouter from './routes/posts.js'
import collectionsRouter from './routes/collections.js'
import Post from './models/Post.js'

import { parseAutonews } from '../scripts/parse/autonews.js'
import { parseJeuneAfrique } from '../scripts/parse/jeuneafrique.js'
import { getPageScrap } from '../scripts/saveRenderedHTML.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 4001
const mongoUri = process.env.MONGODB_URI
const jwtSecret = process.env.JWT_SECRET

if (!mongoUri) { throw new Error('MONGODB_URI missing') }
if (!jwtSecret) { throw new Error('JWT_SECRET missing') }

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://my-flip-board.vercel.app',
  'https://flip-boardbackapi.vercel.app',
]

// Add custom origins from env if provided
if (process.env.CORS_ORIGIN) {
  const customOrigins = process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  allowedOrigins.push(...customOrigins)
}

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return cb(null, true)
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) return cb(null, true)
    
    // Allow localhost with any port for development
    if (/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return cb(null, true)
    
    // Allow all Vercel preview/production deployments
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return cb(null, true)
    
    console.warn('CORS blocked origin:', origin)
    return cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'FlipBoard API is running' })
})

app.use('/api/auth', authRouter)
app.use('/api/auth/oauth', oauthRouter)
app.use('/api/posts', postsRouter)
app.use('/api/collections', collectionsRouter)

async function importJeuneAfriqueBatch() {
  try {
    const items = await parseJeuneAfrique(await getPageScrap('https://www.jeuneafrique.com'))
    const limit = 24
    const imageUrl = '/jeuneafrique.png'
    const seen = new Set()
    for (const it of items.slice(0, limit)) {
      if (!it.url || seen.has(it.url)) continue
      seen.add(it.url)
      const existing = await Post.findOne({ url: it.url })
      if (existing) {
        existing.title = it.title
        existing.type = 'Magazine'
        existing.author = 'JeuneAfrique'
        existing.description = "Un article de JeuneAfrique !"
        existing.imageUrl = imageUrl
        await existing.save()
      } else {
        await Post.create({
          title: it.title,
          type: 'Magazine',
          author: 'JeuneAfrique',
          description: "Un article de JeuneAfrique !",
          imageUrl,
          url: it.url,
        })
      }
    }
    console.log(`[cron] JeuneAfrique imported ${seen.size} items`)
  } catch (e) {
    console.error('[cron] JeuneAfrique import failed', e)
  }
}

async function importAutonewsBatch() {
  try {
    const items = await parseAutonews(await getPageScrap('https://www.autonews.fr'))
    const limit = 24
    const imageUrl = '/autonews.png'
    const seen = new Set()
    for (const it of items.slice(0, limit)) {
      if (!it.url || seen.has(it.url)) continue
      seen.add(it.url)
      const existing = await Post.findOne({ url: it.url })
      if (existing) {
        existing.title = it.title
        existing.type = 'Magazine'
        existing.author = 'Autonews'
        existing.description = "Un article d'AutoNews !"
        existing.imageUrl = imageUrl
        await existing.save()
      } else {
        await Post.create({
          title: it.title,
          type: 'Magazine',
          author: 'Autonews',
          description: "Un article d'AutoNews !",
          imageUrl,
          url: it.url,
        })
      }
    }
    console.log(`[cron] Autonews imported ${seen.size} items`)
  } catch (e) {
    console.error('[cron] Autonews import failed', e)
  }
}

// Initialize DB connection
let isConnected = false
let connectionPromise = null

async function connectDB() {
  if (isConnected) return true
  
  // If connection is already in progress, wait for it
  if (connectionPromise) return connectionPromise
  
  console.log('🔌 Attempting MongoDB connection...')
  console.log('📍 URI:', mongoUri ? `${mongoUri.substring(0, 30)}...` : 'NOT SET')
  
  connectionPromise = (async () => {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 1,
      })
      isConnected = true
      console.log('✅ MongoDB connected successfully!')
      
      // Only import data in development (Puppeteer doesn't work on Vercel)
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔄 Running initial data import (dev mode)')
        await importAutonewsBatch()
        await importJeuneAfriqueBatch()
      }
      
      return true
    } catch (err) {
      console.error('❌ MongoDB connection failed:', err.message)
      console.error('❌ Full error:', err)
      connectionPromise = null
      isConnected = false
      return false
    }
  })()
  
  return connectionPromise
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(port, () => {
      console.log(`API on http://localhost:${port}`)
    })
    setInterval(importAutonewsBatch, 10 * 60 * 1000)
    setInterval(importJeuneAfriqueBatch, 10 * 60 * 1000)
  })
}

// For Vercel serverless - connect on first request
app.use(async (req, res, next) => {
  if (!isConnected) {
    const connected = await connectDB()
    if (!connected) {
      return res.status(503).json({ error: 'Database connection failed' })
    }
  }
  next()
})

export default app
