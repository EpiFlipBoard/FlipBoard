import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export default async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'unauthorized' })
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.uid)
    if (!user) return res.status(401).json({ error: 'unauthorized' })
    req.user = user
    next()
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized' })
  }
}

// Alias for tests
export const authenticateToken = auth;

