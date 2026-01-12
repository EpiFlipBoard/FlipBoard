import express from 'express'
import Newsletter from '../models/Newsletter.js'

const router = express.Router()

router.post('/subscribe', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })
  
  try {
    const existing = await Newsletter.findOne({ email })
    if (existing) return res.json({ message: 'Already subscribed' })
    
    await Newsletter.create({ email })
    res.json({ message: 'Subscribed successfully' })
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router