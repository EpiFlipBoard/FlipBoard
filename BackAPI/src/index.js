import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
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
const corsOriginRaw = process.env.CORS_ORIGIN || 'http://localhost:5174,http://localhost:5173'
const corsOrigins = corsOriginRaw.split(',').map(s => s.trim())
const mongoUri = process.env.MONGODB_URI
const jwtSecret = process.env.JWT_SECRET

if (!mongoUri) { throw new Error('MONGODB_URI missing') }
if (!jwtSecret) { throw new Error('JWT_SECRET missing') }

app.use(cors({
  origin: (origin, cb) => {
    const allowList = [
      ...corsOrigins,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    ]
    if (!origin) return cb(null, true)
    if (allowList.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return cb(null, true)
    return cb(new Error('Not allowed by CORS'))
  },
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

async function connectDB() {
  if (isConnected) return
  try {
    await mongoose.connect(mongoUri)
    isConnected = true
    console.log('MongoDB connected')
    
    // Import data on first connection
    await importAutonewsBatch()
    await importJeuneAfriqueBatch()
  } catch (err) {
    console.error('Mongo connect error', err)
  }
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

// For Vercel serverless
app.use(async (req, res, next) => {
  await connectDB()
  next()
})

export default app
