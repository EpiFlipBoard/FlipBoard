import express from 'express'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

function sign(user) {
  return jwt.sign({ uid: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

const DEFAULT_FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5174/login'

router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/oauth/google/callback'
  const scope = encodeURIComponent('openid email profile')
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`
  res.redirect(url)
})

router.get('/google/callback', async (req, res) => {
  try {
    const code = req.query.code
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/oauth/google/callback'

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })
    const tokenJson = await tokenRes.json()
    if (!tokenRes.ok) throw new Error(tokenJson.error_description || 'google token error')

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    })
    const profile = await userRes.json()
    const email = profile.email || `google-${profile.id}@oauth.local`
    const name = profile.name || 'Google User'

    let user = await User.findOne({ email })
    if (!user) {
      user = await User.create({ email, name, passwordHash: '__oauth_google__' })
    }
    const token = sign(user)
    const target = req.query.origin || DEFAULT_FRONTEND_URL
    return res.redirect(`${target}?token=${encodeURIComponent(token)}`)
  } catch (e) {
    return res.status(500).json({ error: 'oauth failed' })
  }
})

router.get('/facebook', (req, res) => {
  const clientId = process.env.FACEBOOK_CLIENT_ID
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:4000/api/auth/oauth/facebook/callback'
  const scope = encodeURIComponent('email,public_profile')
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`
  res.redirect(url)
})

router.get('/facebook/callback', async (req, res) => {
  try {
    const code = req.query.code
    const clientId = process.env.FACEBOOK_CLIENT_ID
    const clientSecret = process.env.FACEBOOK_CLIENT_SECRET
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:4000/api/auth/oauth/facebook/callback'

    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${encodeURIComponent(code)}`
    const tokenRes = await fetch(tokenUrl)
    const tokenJson = await tokenRes.json()
    if (!tokenRes.ok) throw new Error(tokenJson.error?.message || 'facebook token error')

    const userRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenJson.access_token}`)
    const profile = await userRes.json()
    const email = profile.email || `facebook-${profile.id}@oauth.local`
    const name = profile.name || 'Facebook User'

    let user = await User.findOne({ email })
    if (!user) {
      user = await User.create({ email, name, passwordHash: '__oauth_facebook__' })
    }
    const token = sign(user)
    const target = req.query.origin || DEFAULT_FRONTEND_URL
    return res.redirect(`${target}?token=${encodeURIComponent(token)}`)
  } catch (e) {
    return res.status(500).json({ error: 'oauth failed' })
  }
})

export default router