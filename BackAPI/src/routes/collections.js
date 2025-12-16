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
  const c = await Collection.findById(req.params.id).populate('posts')
  if (!c || String(c.userId) !== String(req.user._id)) return res.status(404).json({ error: 'not found' })
  res.json({ collection: c })
})

router.post('/:id/posts', auth, async (req, res) => {
  const c = await Collection.findById(req.params.id)
  if (!c || String(c.userId) !== String(req.user._id)) return res.status(404).json({ error: 'not found' })
  const { postId } = req.body
  if (!postId) return res.status(400).json({ error: 'postId required' })
  if (!c.posts.includes(postId)) {
    c.posts.push(postId)
    await c.save()
  }
  const populated = await Collection.findById(c._id).populate('posts')
  res.json({ collection: populated })
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
