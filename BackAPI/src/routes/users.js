import express from 'express'
import User from '../models/User.js'
import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    let user
    let posts

    // 1. Try to find by ID if it looks like an ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(id).select('-passwordHash')
    }
    
    // 2. If not found (or not ObjectId), try to find by name (for sources)
    if (!user) {
      const name = decodeURIComponent(id)
      user = await User.findOne({ name }).select('-passwordHash')
      
      // 3. If still not found, create a virtual user object
      if (!user) {
        user = {
          _id: null,
          name: name,
          avatar: '', 
          createdAt: new Date(),
          isSource: true
        }
      }
    }
    
    // Get posts
    if (user._id) {
       posts = await Post.find({ 
         $or: [
           { authorId: user._id },
           { author: user.name }
         ]
       }).sort({ createdAt: -1 })
    } else {
       // For virtual users, we only have the name
       posts = await Post.find({ author: user.name }).sort({ createdAt: -1 })
    }
    
    res.json({ user, posts })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

// Toggle follow
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const { id } = req.params
    let targetUser

    // 1. Try to find target user
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      targetUser = await User.findById(id)
    }

    if (!targetUser) {
      const name = decodeURIComponent(id)
      targetUser = await User.findOne({ name })
      
      // 2. If not found and it's a name request, create the source user
      if (!targetUser) {
        // Create source user
        targetUser = await User.create({
          name: name,
          email: `source_${name.replace(/[^a-zA-Z0-9]/g, '_')}@internal.flipboard`,
          passwordHash: 'source_dummy_hash',
          isSource: true,
          avatar: ''
        })
      }
    }
    
    if (targetUser._id.equals(req.user._id)) {
      return res.status(400).json({ error: 'Cannot follow yourself' })
    }

    const currentUser = await User.findById(req.user._id)
    
    const isFollowing = currentUser.following.includes(targetUser._id)
    
    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => !id.equals(targetUser._id))
      targetUser.followers = targetUser.followers.filter(id => !id.equals(currentUser._id))
    } else {
      // Follow
      currentUser.following.push(targetUser._id)
      targetUser.followers.push(currentUser._id)
    }
    
    await currentUser.save()
    await targetUser.save()
    
    res.json({ following: !isFollowing })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get activity feed (for "Follows" page)
// - Liked posts
// - Commented posts
// - Posts from followed users
router.get('/me/activity', auth, async (req, res) => {
  try {
    const userId = req.user._id
    const user = await User.findById(userId)

    // 1. Posts liked by user
    const likedPosts = await Post.find({ likedBy: userId }).sort({ createdAt: -1 }).limit(20)

    // 2. Posts commented by user
    // First find comment IDs, then find posts
    const comments = await Comment.find({ userId }).sort({ createdAt: -1 }).limit(20)
    const commentedPostIds = [...new Set(comments.map(c => c.postId))]
    const commentedPosts = await Post.find({ _id: { $in: commentedPostIds } })

    // 3. Posts by followed authors
    const followedUsers = await User.find({ _id: { $in: user.following } })
    const followedIds = followedUsers.map(u => u._id)
    const followedNames = followedUsers.map(u => u.name)

    const followedPosts = await Post.find({
      $or: [
        { authorId: { $in: followedIds } },
        { author: { $in: followedNames } }
      ]
    }).sort({ createdAt: -1 }).limit(20)

    res.json({
      liked: likedPosts,
      commented: commentedPosts,
      following: followedPosts,
      followedUsers: followedUsers.map(u => ({ _id: u._id, name: u.name, avatar: u.avatar }))
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router