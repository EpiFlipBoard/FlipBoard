import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import Collection from '../models/Collection.js'
import Newsletter from '../models/Newsletter.js'
import auth from '../middleware/auth.js'

const router = express.Router()

export function sign(user) {
  return jwt.sign({ uid: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function buildUserPayload(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar || '',
    isGoogle: user.passwordHash === '__oauth_google__',
  }
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
    return res.json({ token, user: buildUserPayload(user) })
  } catch {
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
    return res.json({ token, user: buildUserPayload(user) })
  } catch {
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
    return res.json({ user: buildUserPayload(user) })
  } catch {
    return res.status(401).json({ error: 'unauthorized' })
  }
})

router.delete('/me', auth, async (req, res) => {
  try {
    const userId = req.user._id
    const email = req.user.email

    const ownedPosts = await Post.find({ authorId: userId }, { _id: 1 })
    const ownedPostIds = ownedPosts.map(p => p._id)

    await Comment.deleteMany({ $or: [{ userId }, { postId: { $in: ownedPostIds } }] })

    if (ownedPostIds.length) {
      await Collection.updateMany({ posts: { $in: ownedPostIds } }, { $pull: { posts: { $in: ownedPostIds } } })
      await Post.deleteMany({ _id: { $in: ownedPostIds } })
    }

    await Collection.deleteMany({ userId })

    const likedPosts = await Post.find({ likedBy: userId }, { _id: 1, likedBy: 1, likes: 1 })
    for (const post of likedPosts) {
      const nextLikes = Math.max(0, (post.likedBy || []).length - 1)
      await Post.updateOne({ _id: post._id }, { $pull: { likedBy: userId }, $set: { likes: nextLikes } })
    }

    await User.updateMany({ following: userId }, { $pull: { following: userId } })
    await User.updateMany({ followers: userId }, { $pull: { followers: userId } })

    if (email) {
      await Newsletter.deleteOne({ email })
    }

    await User.deleteOne({ _id: userId })

    return res.json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'server error' })
  }
})

export default router