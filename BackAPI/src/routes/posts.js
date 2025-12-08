import express from 'express'
import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import Collection from '../models/Collection.js'
import auth from '../middleware/auth.js'

const router = express.Router()

async function ensureSeed() {
  const count = await Post.countDocuments()
  if (count > 0) return
  await Post.insertMany([
    { title: 'Our Planet', type: 'Magazine', author: 'Epi-Flipboard team', description: 'Une exploration de notre monde.', imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop' },
    { title: 'Design Stories', type: 'Magazine', author: 'Epi-Flipboard team', description: 'Histoires de design modernes.', imageUrl: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop' },
    { title: 'Tech Horizons', type: 'Magazine', author: 'Epi-Flipboard team', description: 'Tendances tech et innovations.', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop' },
  ])
}

router.get('/', async (req, res) => {
  await ensureSeed()
  const posts = await Post.find({}).sort({ createdAt: -1 })
  res.json({ posts })
})

router.post('/:id/like', auth, async (req, res) => {
  const { id } = req.params
  const userId = req.user._id
  const post = await Post.findById(id)
  if (!post) return res.status(404).json({ error: 'not found' })
  const liked = post.likedBy.some(u => String(u) === String(userId))
  if (liked) {
    post.likedBy = post.likedBy.filter(u => String(u) !== String(userId))
  } else {
    post.likedBy.push(userId)
  }
  post.likes = post.likedBy.length
  await post.save()
  res.json({ likes: post.likes, liked: !liked })
})

router.get('/:id/comments', async (req, res) => {
  const { id } = req.params
  const comments = await Comment.find({ postId: id }).sort({ createdAt: -1 })
  res.json({ comments })
})

router.post('/:id/comments', auth, async (req, res) => {
  const { id } = req.params
  const { text } = req.body || {}
  if (!text) return res.status(400).json({ error: 'text required' })
  const c = await Comment.create({ postId: id, userId: req.user._id, text })
  res.json({ comment: { id: c._id, text: c.text, userId: c.userId, createdAt: c.createdAt } })
})

router.post('/:id/collect', auth, async (req, res) => {
  const { id } = req.params
  let collection = await Collection.findOne({ userId: req.user._id })
  if (!collection) collection = await Collection.create({ userId: req.user._id, name: 'My Collection', posts: [] })
  if (!collection.posts.some(p => String(p) === String(id))) {
    collection.posts.push(id)
    await collection.save()
  }
  res.json({ added: true, collectionId: collection._id })
})

export default router

