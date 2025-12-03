import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import authRouter from './routes/auth.js'
import oauthRouter from './routes/oauth.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 4000
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

app.use('/api/auth', authRouter)
app.use('/api/auth/oauth', oauthRouter)

mongoose.connect(mongoUri).then(() => {
  app.listen(port, () => {
    console.log(`API on http://localhost:${port}`)
  })
}).catch(err => {
  console.error('Mongo connect error', err)
  process.exit(1)
})