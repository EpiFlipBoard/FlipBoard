import express from 'express'
import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import Collection from '../models/Collection.js'
import User from '../models/User.js'
import auth from '../middleware/auth.js'
import jwt from 'jsonwebtoken'

import { getPageScrap } from '../../scripts/saveRenderedHTML.js'
import { parseAutonews } from '../../scripts/parse/autonews.js'
import { parseJeuneAfrique } from '../../scripts/parse/jeuneafrique.js'
import { fetchAndSaveArticles } from '../../apis/aggregator.js'
import { sendEmail } from '../utils/sendEmail.js'

const router = express.Router()

router.get('/search', async (req, res) => {
  const { q, filter } = req.query
  if (!q) return res.json({ posts: [] })
  
  const query = {}
  if (filter === 'author') {
    query.author = { $regex: q, $options: 'i' }
  } else {
    query.title = { $regex: q, $options: 'i' }
  }

  const posts = await Post.find(query).limit(20)
  res.json({ posts })
})

router.get('/random', async (req, res) => {
  try {
    const posts = await Post.aggregate([
      { $match: { url: { $exists: true, $ne: '' } } },
      { $sample: { size: 1 } }
    ])
    
    if (!posts || posts.length === 0) {
      return res.status(404).json({ error: 'No external articles found' })
    }
    
    res.json(posts[0])
  } catch (error) {
    console.error('Error fetching random post:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

function hostname(url) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return '' }
}

async function fetchOg(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const html = await res.text()
    const getMeta = (prop) => {
      const re = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i')
      const m = html.match(re)
      return m ? m[1] : ''
    }
    const getName = (name) => {
      const re = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i')
      const m = html.match(re)
      return m ? m[1] : ''
    }
    const title = getMeta('og:title') || getName('title') || (html.match(/<title>([^<]+)<\/title>/i)?.[1] || '').trim()
    const description = getMeta('og:description') || getName('description')
    const image = getMeta('og:image')
    const siteName = getMeta('og:site_name') || hostname(url)
    return { title, description, imageUrl: image, source: siteName }
  } catch {
    return { title: '', description: '', imageUrl: '', source: hostname(url) }
  }
}



async function refreshSources() {
  try {
    const result = await fetchAndSaveArticles(Post, {}, { 
      sources: ['rss'], 
      pageSize: 20 
    })
    return result
  } catch (err) {
    console.error('Error refreshing sources:', err.message)
    throw err
  }
}

let isSeedingInProgress = false

async function ensureSeed() {
  const count = await Post.countDocuments()
  if (count > 0) return
  
  if (isSeedingInProgress) return
  
  try {
    isSeedingInProgress = true
    await refreshSources()
  } finally {
    isSeedingInProgress = false
  }
}

router.get('/', async (req, res) => {
  await ensureSeed()
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 12
  const skip = (page - 1) * limit

  const query = {}

  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()

  // Convert ObjectIds to strings for likedBy
  const postsWithStringIds = posts.map(p => ({
    ...p,
    likedBy: (p.likedBy || []).map(id => String(id))
  }))

  const total = await Post.countDocuments()
  
  res.json({ 
    posts: postsWithStringIds,
    hasMore: skip + posts.length < total,
    total
  })
})

router.get('/liked', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('likedPosts')
    res.json({ posts: user.likedPosts || [] })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/refresh', async (req, res) => {
  await refreshSources()
  const posts = await Post.find({}).sort({ createdAt: -1 })
  res.json({ ok: true, posts })
})

router.post('/refresh/autonews', async (req, res) => {
  try {
    const items = await parseAutonews(await getPageScrap('https://www.autonews.fr'))
    const limit = 24
    const imageUrl = '/autonews.png'
    for (const it of items.slice(0, limit)) {
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
    const posts = await Post.find({}).sort({ createdAt: -1 })
    res.json({ ok: true, source: 'autonews', imported: Math.min(items.length, limit), posts })
  } catch {
    res.status(500).json({ ok: false, source: 'autonews', error: 'failed to import' })
  }
})

router.post('/refresh/jeuneafrique', async (req, res) => {
  try {
    const items = await parseJeuneAfrique(await getPageScrap('https://www.jeuneafrique.com'))
    const limit = 24
    const imageUrl = '/jeuneafrique.png'
    for (const it of items.slice(0, limit)) {
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
    const posts = await Post.find({}).sort({ createdAt: -1 })
    res.json({ ok: true, source: 'jeuneafrique', imported: Math.min(items.length, limit), posts })
  } catch {
    res.status(500).json({ ok: false, source: 'jeuneafrique', error: 'failed to import' })
  }
})

router.post('/import', auth, async (req, res) => {
  const { url } = req.body || {}
  if (!url) return res.status(400).json({ error: 'url required' })
  const meta = await fetchOg(url)
  if (!meta.title) return res.status(422).json({ error: 'no metadata found' })
  let post = await Post.findOne({ url })
  if (post) {
    post.title = meta.title
    post.description = meta.description || post.description
    post.imageUrl = meta.imageUrl || post.imageUrl
    post.author = meta.source
    post.type = 'Article'
    await post.save()
  } else {
    post = await Post.create({
      title: meta.title,
      type: 'Article',
      author: meta.source,
      description: meta.description,
      imageUrl: meta.imageUrl,
      url,
    })
  }
  res.json({ post })
})

router.post('/create', auth, async (req, res) => {
  const { title, content, imageUrl, description } = req.body || {}
  if (!title || !content) return res.status(400).json({ error: 'title and content required' })
  const post = await Post.create({
    title,
    content,
    imageUrl: imageUrl || '',
    description: description || content.slice(0, 150) + '...',
    type: 'Article',
    author: req.user.name || 'User',
    authorId: req.user._id,
    url: '' // Empty URL signifies internal article
  })

  // Notify followers
  try {
    const user = await User.findById(req.user._id).populate('followers')
    if (user && user.followers.length > 0) {
      const emails = user.followers.map(u => u.email)
      console.log(`[EMAIL NOTIFICATION] Sending email to followers of ${user.name}:`, emails)
      
      const emailHtml = `
        <h1>New Post from ${user.name}</h1>
        <h2>${title}</h2>
        <p>${description}</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/article/${post._id}">Read more</a>
      `

      // Send emails in parallel
      await Promise.all(emails.map(email => sendEmail({
        to: email,
        subject: `New post from ${user.name}: ${title}`,
        html: emailHtml
      })))
    }
  } catch (e) {
    console.error('Failed to send notifications', e)
  }

  res.json({ post })
})

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'not found' })

    res.json({ post })
  } catch {
    res.status(404).json({ error: 'not found' })
  }
})

router.post('/:id/like', auth, async (req, res) => {
  const { id } = req.params
  const userId = req.user._id
  const post = await Post.findById(id)
  if (!post) return res.status(404).json({ error: 'not found' })
  
  const user = await User.findById(userId)
  if (!user) return res.status(404).json({ error: 'user not found' })
  
  const liked = post.likedBy.some(u => String(u) === String(userId))
  if (liked) {
    post.likedBy = post.likedBy.filter(u => String(u) !== String(userId))
    user.likedPosts = user.likedPosts.filter(p => String(p) !== String(id))
  } else {
    post.likedBy.push(userId)
    user.likedPosts.push(id)
  }
  post.likes = post.likedBy.length
  await post.save()
  await user.save()
  res.json({ likes: post.likes, liked: !liked })
})

router.get('/:id/comments', async (req, res) => {
  const { id } = req.params
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 5
  const skip = (page - 1) * limit

   try {
     const query = { postId: id }

     const total = await Comment.countDocuments(query)
    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name avatar')
    
    res.json({ 
      comments: comments.map(c => ({
        id: c._id,
        text: c.text,
        createdAt: c.createdAt,
        user: c.userId ? { id: c.userId._id, name: c.userId.name, avatar: c.userId.avatar } : null
      })),
      total,
      hasMore: skip + comments.length < total
    })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/:id/comments', auth, async (req, res) => {
  const { id } = req.params
  const { text } = req.body || {}
  if (!text) return res.status(400).json({ error: 'text required' })
  const c = await Comment.create({ postId: id, userId: req.user._id, text })
  res.json({ comment: { id: c._id, text: c.text, userId: c.userId, createdAt: c.createdAt } })
})

router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  const { commentId } = req.params
  try {
    const comment = await Comment.findById(commentId)
    if (!comment) return res.status(404).json({ error: 'Comment not found' })
    
    // Check if user is author
    if (String(comment.userId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    await Comment.findByIdAndDelete(commentId)
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    res.status(500).json({ error: 'Server error' })
  }
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

// Nouvelle route pour récupérer des articles via APIs
router.post('/fetch-latest', async (req, res) => {
  try {
    const apiKeys = {
      newsapi: process.env.NEWSAPI_KEY,
      guardian: process.env.GUARDIAN_API_KEY,
      nytimes: process.env.NYTIMES_API_KEY
    }

    const options = {
      sources: ['rss'], // Par défaut RSS (gratuit)
      pageSize: 20
    }

    // Si des clés API sont fournies, ajouter les sources
    if (apiKeys.newsapi) options.sources.push('newsapi')
    if (apiKeys.guardian) options.sources.push('guardian')
    if (apiKeys.nytimes) options.sources.push('nytimes')

    const result = await fetchAndSaveArticles(Post, apiKeys, options)
    
    res.json({
      success: true,
      message: `${result.saved} nouveaux articles ajoutés, ${result.updated} mis à jour`,
      ...result
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    res.status(500).json({ error: 'Failed to fetch articles', details: error.message })
  }
})

// Route pour récupérer des articles avec des paramètres personnalisés
router.post('/fetch-custom', async (req, res) => {
  try {
    const { sources, pageSize, category, query } = req.body

    const apiKeys = {
      newsapi: process.env.NEWSAPI_KEY,
      guardian: process.env.GUARDIAN_API_KEY,
      nytimes: process.env.NYTIMES_API_KEY
    }

    const result = await fetchAndSaveArticles(Post, apiKeys, {
      sources: sources || ['rss'],
      pageSize: pageSize || 10,
      category,
      query
    })
    
    res.json({
      success: true,
      message: `${result.saved} nouveaux articles ajoutés, ${result.updated} mis à jour`,
      ...result
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    res.status(500).json({ error: 'Failed to fetch articles', details: error.message })
  }
})

export default router
