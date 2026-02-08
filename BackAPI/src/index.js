import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

mongoose.set('strictQuery', false)
// Augmenter le timeout pour les opérations en buffer
mongoose.set('bufferTimeoutMS', 30000)

import authRouter from './routes/auth.js'
import oauthRouter from './routes/oauth.js'
import postsRouter from './routes/posts.js'
import collectionsRouter from './routes/collections.js'
import usersRouter from './routes/users.js'
import newsletterRouter from './routes/newsletter.js'
import Post from './models/Post.js'

import { parseAutonews } from '../scripts/parse/autonews.js'
import { parseJeuneAfrique } from '../scripts/parse/jeuneafrique.js'
import { getPageScrap } from '../scripts/saveRenderedHTML.js'
import { fetchAndSaveArticles } from '../apis/aggregator.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 4000
const corsOriginRaw = process.env.CORS_ORIGIN || 'http://localhost:5174,http://localhost:5173'
const corsOrigins = corsOriginRaw.split(',').map(s => s.trim())
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

// Initialize DB connection
let isConnected = false
let connectionPromise = null
let isPopulating = false // Protection contre les appels multiples

async function connectDB() {
  if (isConnected) return true
  
  // If connection is already in progress, wait for it
  if (connectionPromise) return connectionPromise
  
  connectionPromise = (async () => {
    try {
      const options = {
        serverSelectionTimeoutMS: 30000, // Augmenté à 30 secondes pour Vercel
        socketTimeoutMS: 45000,
      }
      
      // For Vercel/serverless: use smaller pool
      if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        options.maxPoolSize = 1
        options.minPoolSize = 0
      } else {
        options.maxPoolSize = 10
        options.minPoolSize = 2
      }
      
      await mongoose.connect(mongoUri, options)
      
      // Wait for connection to be ready
      let retries = 0
      while (mongoose.connection.readyState !== 1 && retries < 30) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        retries++
      }
      
      if (mongoose.connection.readyState !== 1) {
        throw new Error(`Connection readyState is ${mongoose.connection.readyState}, expected 1`)
      }
      
      isConnected = true
      console.log('✅ MongoDB connected successfully')
      
      // Setup event listeners for connection monitoring
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected')
        isConnected = false
        connectionPromise = null
      })
      
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB error:', err)
        isConnected = false
        connectionPromise = null
      })
      
      // Import data based on environment
      if (process.env.NODE_ENV !== 'production') {
        // En développement: tout importer
        console.log('🔄 Running initial data import (dev mode)')
        await importAutonewsBatch()
        await importJeuneAfriqueBatch()
        await autoPopulateArticles()
      } else {
        // En production: seulement auto-populate (pas de Puppeteer sur Vercel)
        console.log('🔄 Running initial auto-populate (production mode)')
        await autoPopulateArticles()
      }
      
      return true
    } catch (err) {
      console.error('❌ MongoDB connection failed:', err.message)
      connectionPromise = null
      isConnected = false
      return false
    }
  })()
  
  return connectionPromise
}

// For Vercel serverless - connect on first request (BEFORE routes)
app.use(async (req, res, next) => {
  if (!isConnected) {
    console.log('🔌 Connecting to MongoDB...')
    const connected = await connectDB()
    if (!connected) {
      return res.status(503).json({ 
        error: 'Database connection failed',
        message: 'Please try again in a few seconds'
      })
    }
  }
  
  // Check if connection is still alive
  if (mongoose.connection.readyState !== 1) {
    console.log('⚠️ MongoDB disconnected, reconnecting...')
    isConnected = false
    connectionPromise = null
    const connected = await connectDB()
    if (!connected) {
      return res.status(503).json({ 
        error: 'Database reconnection failed',
        message: 'Please try again'
      })
    }
  }
  
  next()
})

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'FlipBoard API is running' })
})

app.use('/api/auth', authRouter)
app.use('/api/auth/oauth', oauthRouter)
app.use('/api/posts', postsRouter)
app.use('/api/collections', collectionsRouter)
app.use('/api/users', usersRouter)
app.use('/api/newsletter', newsletterRouter)

// Route pour le cron job d'auto-population
app.get('/api/cron/populate', async (req, res) => {
  try {
    console.log('🔄 [Cron] Déclenchement de l\'auto-populate...')
    await autoPopulateArticles()
    res.json({ success: true, message: 'Articles mis à jour avec succès' })
  } catch (error) {
    console.error('❌ [Cron] Erreur:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Route pour nettoyer les articles en double
app.get('/api/admin/clean-duplicates', async (req, res) => {
  try {
    console.log('🧹 [Clean] Nettoyage des doublons...')
    
    // Trouver tous les articles groupés par URL
    const duplicates = await Post.aggregate([
      {
        $group: {
          _id: '$url',
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ])

    let totalDeleted = 0
    for (const dup of duplicates) {
      // Garder le premier, supprimer les autres
      const toDelete = dup.ids.slice(1)
      const result = await Post.deleteMany({ _id: { $in: toDelete } })
      totalDeleted += result.deletedCount
    }

    const totalArticles = await Post.countDocuments()
    
    console.log(`✅ [Clean] ${totalDeleted} doublons supprimés`)
    res.json({ 
      success: true, 
      duplicatesFound: duplicates.length,
      articlesDeleted: totalDeleted,
      totalArticles 
    })
  } catch (error) {
    console.error('❌ [Clean] Erreur:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

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

// Fonction pour auto-populer les articles depuis les API news
async function autoPopulateArticles() {
  // Protection contre les appels multiples simultanés
  if (isPopulating) {
    console.log('⚠️ [Auto-populate] Déjà en cours, appel ignoré')
    return { saved: 0, updated: 0, total: 0 }
  }
  
  isPopulating = true
  
  try {
    console.log('🔄 [Auto-populate] Récupération des nouveaux articles...')
    
    const apiKeys = {
      newsapi: process.env.NEWSAPI_KEY,
      guardian: process.env.GUARDIAN_API_KEY,
      nytimes: process.env.NYTIMES_API_KEY
    }

    // Configuration des sources
    const sources = ['rss'] // RSS est gratuit
    if (apiKeys.newsapi) sources.push('newsapi')
    if (apiKeys.guardian) sources.push('guardian')
    if (apiKeys.nytimes) sources.push('nytimes')

    const result = await fetchAndSaveArticles(Post, apiKeys, {
      sources,
      pageSize: 15
    })

    console.log(`✅ [Auto-populate] ${result.saved} nouveaux articles, ${result.updated} mis à jour (${result.total} total)`)
    return result
  } catch (error) {
    console.error('❌ [Auto-populate] Erreur:', error.message)
    return { saved: 0, updated: 0, total: 0 }
  } finally {
    isPopulating = false
  }
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(port, () => {
      console.log(`API on http://localhost:${port}`)
      console.log('⏰ Auto-populate activé: toutes les heures')
    })
    setInterval(importAutonewsBatch, 10 * 60 * 1000)
    setInterval(importJeuneAfriqueBatch, 10 * 60 * 1000)
    // Auto-populate les articles toutes les heures
    setInterval(autoPopulateArticles, 60 * 60 * 1000)
  })
}

export default app
