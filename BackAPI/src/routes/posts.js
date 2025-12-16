import express from 'express'
import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import Collection from '../models/Collection.js'
import auth from '../middleware/auth.js'

import { getPageScrap } from '../../scripts/saveRenderedHTML.js'
import { parseAutonews } from '../../scripts/parse/autonews.js'
import { parseJeuneAfrique } from '../../scripts/parse/jeuneafrique.js'

const router = express.Router()

router.get('/search', async (req, res) => {
  const { q } = req.query
  if (!q) return res.json({ posts: [] })
  const posts = await Post.find({ title: { $regex: q, $options: 'i' } }).limit(20)
  res.json({ posts })
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

const feedSources = [
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://feeds.reuters.com/reuters/worldNews',
  'https://www.theverge.com/rss/index.xml',
  'https://www.wired.com/feed/rss',
  'https://www.theguardian.com/world/rss',
  'https://feeds.arstechnica.com/arstechnica/index',
  'https://techcrunch.com/feed/',
  'https://www.engadget.com/rss.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  'https://www.cnet.com/rss/news/',
]

function stripTags(s) {
  return (s || '').replace(/<[^>]*>/g, '').trim()
}

function getTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, 'i'))
  return m ? m[1].trim() : ''
}

function getAttr(xml, tag, attr) {
  const m = xml.match(new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["'][^>]*>`, 'i'))
  return m ? m[1] : ''
}

function parseRss(xml) {
  const items = xml.split(/<item[\s\S]*?>/i).slice(1).map(chunk => {
    const title = stripTags(getTag(chunk, 'title'))
    const link = stripTags(getTag(chunk, 'link'))
    const description = stripTags(getTag(chunk, 'description'))
    const image = getAttr(chunk, 'enclosure', 'url') || getAttr(chunk, 'media:content', 'url') || getAttr(chunk, 'media:thumbnail', 'url')
    return { title, link, description, imageUrl: image }
  })
  return items.filter(i => i.title && i.link)
}

function parseAtom(xml) {
  const entries = xml.split(/<entry[\s\S]*?>/i).slice(1).map(chunk => {
    const title = stripTags(getTag(chunk, 'title'))
    const link = (() => {
      const href = getAttr(chunk, 'link', 'href')
      if (href) return href
      const m = chunk.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*>/i)
      return m ? m[1] : ''
    })()
    const description = stripTags(getTag(chunk, 'summary') || getTag(chunk, 'content'))
    const image = getAttr(chunk, 'media:content', 'url') || getAttr(chunk, 'media:thumbnail', 'url')
    return { title, link, description, imageUrl: image }
  })
  return entries.filter(i => i.title && i.link)
}

async function refreshSources() {
  const limit = 12
  for (const feed of feedSources) {
    try {
      const res = await fetch(feed, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      const xml = await res.text()
      const isAtom = /<feed[\s\S]*?>/i.test(xml)
      const items = (isAtom ? parseAtom(xml) : parseRss(xml)).slice(0, limit)
      const sourceName = hostname(feed)
      for (const it of items) {
        let image = it.imageUrl
        if (!image) {
          const meta = await fetchOg(it.link)
          image = meta.imageUrl
        }
        const exists = await Post.findOne({ url: it.link })
        if (exists) {
          exists.title = it.title
          exists.description = it.description || exists.description
          exists.imageUrl = image || exists.imageUrl
          exists.author = sourceName
          exists.type = 'Article'
          await exists.save()
        } else {
          await Post.create({
            title: it.title,
            type: 'Article',
            author: sourceName,
            description: it.description,
            imageUrl: image,
            url: it.link,
          })
        }
      }
    } catch {}
  }
}

async function ensureSeed() {
  const count = await Post.countDocuments()
  if (count > 0) return
  await refreshSources()
}

router.get('/', async (req, res) => {
  await ensureSeed()
  const posts = await Post.find({}).sort({ createdAt: -1 })
  res.json({ posts })
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
  } catch (e) {
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
  } catch (e) {
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
