import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import authRouter from './routes/auth.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 4000
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5174'
const mongoUri = process.env.MONGODB_URI
const jwtSecret = process.env.JWT_SECRET

if (!mongoUri) { throw new Error('MONGODB_URI missing') }
if (!jwtSecret) { throw new Error('JWT_SECRET missing') }

app.use(cors({ origin: corsOrigin }))
app.use(express.json())

app.use('/api/auth', authRouter)

mongoose.connect(mongoUri).then(() => {
  app.listen(port, () => {
    console.log(`API on http://localhost:${port}`)
  })
}).catch(err => {
  console.error('Mongo connect error', err)
  process.exit(1)
})