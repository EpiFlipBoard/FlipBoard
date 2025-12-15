import express from 'express'
import Collection from '../models/Collection.js'
import auth from '../middleware/auth.js'

const router = express.Router()

router.get('/me', auth, async (req, res) => {
  const collections = await Collection.find({ userId: req.user._id }).sort({ createdAt: -1 })
  res.json({ collections })
})

router.post('/', auth, async (req, res) => {
  const { name, isPrivate } = req.body || {}
  const n = (name || '').trim() || 'My Collection'
  const c = await Collection.create({ userId: req.user._id, name: n, isPrivate: !!isPrivate, posts: [] })
  res.json({ collection: c })
})

router.get('/:id', auth, async (req, res) => {
  const c = await Collection.findById(req.params.id)
  if (!c || String(c.userId) !== String(req.user._id)) return res.status(404).json({ error: 'not found' })
  res.json({ collection: c })
})

router.patch('/:id', auth, async (req, res) => {
  const c = await Collection.findById(req.params.id)
  if (!c || String(c.userId) !== String(req.user._id)) return res.status(404).json({ error: 'not found' })
  const { name, description, imageUrl, isPrivate } = req.body || {}
  if (typeof name === 'string') c.name = name.trim() || c.name
  if (typeof description === 'string') c.description = description
  if (typeof imageUrl === 'string') c.imageUrl = imageUrl
  if (typeof isPrivate === 'boolean') c.isPrivate = isPrivate
  await c.save()
  res.json({ collection: c })
})

export default router
