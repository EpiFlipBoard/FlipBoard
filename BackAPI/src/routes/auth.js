import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

export function sign(user) {
  return jwt.sign({ uid: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ error: 'email already registered' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ email, passwordHash, name })
    const token = sign(user)
    return res.json({ token, user: { id: user._id, email: user.email, name: user.name } })
  } catch (e) {
    return res.status(500).json({ error: 'server error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'invalid credentials' })
    const token = sign(user)
    return res.json({ token, user: { id: user._id, email: user.email, name: user.name } })
  } catch (e) {
    return res.status(500).json({ error: 'server error' })
  }
})

router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'unauthorized' })
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.uid)
    if (!user) return res.status(404).json({ error: 'not found' })
    return res.json({ user: { id: user._id, email: user.email, name: user.name } })
  } catch {
    return res.status(401).json({ error: 'unauthorized' })
  }
})

export default router