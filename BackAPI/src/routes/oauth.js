import express from 'express'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

function sign(user) {
  return jwt.sign({ uid: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

const DEFAULT_FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173/'

// Helper to safely redirect with error
const redirectError = (res, target, message) => {
  try {
    const url = new URL(target)
    url.searchParams.set('error', message)
    res.redirect(url.toString())
  } catch (e) {
    // Fallback if target is invalid
    res.redirect(`${DEFAULT_FRONTEND_URL}?error=${message}`)
  }
}

router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/oauth/google/callback'
  
  if (!clientId) return res.status(500).send('Missing GOOGLE_CLIENT_ID')

  const scope = encodeURIComponent('openid email profile')
  // Pass origin in state parameter
  const state = encodeURIComponent(req.query.origin || DEFAULT_FRONTEND_URL)
  
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`
  res.redirect(url)
})

router.get('/google/callback', async (req, res) => {
  // Decode state to get the original target URL
  const target = req.query.state ? decodeURIComponent(req.query.state) : DEFAULT_FRONTEND_URL
  
  try {
    const code = req.query.code
    if (!code) throw new Error('No code provided')

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/oauth/google/callback'

    console.log('[Google OAuth] Processing callback', { code: code.substring(0, 5) + '...', redirectUri })

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
    if (!tokenRes.ok) {
        console.error('[Google OAuth] Token Error:', tokenJson)
        throw new Error(tokenJson.error_description || 'google token error')
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    })
    
    const profile = await userRes.json()
    if (!userRes.ok) {
        console.error('[Google OAuth] Profile Error:', profile)
        throw new Error('Failed to fetch user profile')
    }
    
    console.log('[Google OAuth] User authenticated:', profile.email)

    const email = profile.email || `google-${profile.id}@oauth.local`
    const name = profile.name || 'Google User'
    const avatar = profile.picture || ''

    let user = await User.findOne({ email })
    if (!user) {
      user = await User.create({ email, name, passwordHash: '__oauth_google__', avatar })
    }
    
    const token = sign(user)
    
    // Redirect back to frontend with token
    const redirectUrl = new URL(target)
    redirectUrl.searchParams.set('token', token)
    return res.redirect(redirectUrl.toString())

  } catch (err) {
    console.error('[Google OAuth] Exception:', err)
    return redirectError(res, target, 'oauth_failed')
  }
})

router.get('/facebook', (req, res) => {
  const clientId = process.env.FACEBOOK_CLIENT_ID
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:4000/api/auth/oauth/facebook/callback'
  
  if (!clientId) {
      console.error('[Facebook OAuth] Missing FACEBOOK_CLIENT_ID')
      const target = req.query.origin || DEFAULT_FRONTEND_URL
      return redirectError(res, target, 'missing_configuration')
  }

  const scope = encodeURIComponent('email,public_profile')
  const state = encodeURIComponent(req.query.origin || DEFAULT_FRONTEND_URL)
  
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`
  res.redirect(url)
})

router.get('/facebook/callback', async (req, res) => {
  const target = req.query.state ? decodeURIComponent(req.query.state) : DEFAULT_FRONTEND_URL

  try {
    const code = req.query.code
    if (!code) throw new Error('No code provided')

    const clientId = process.env.FACEBOOK_CLIENT_ID
    const clientSecret = process.env.FACEBOOK_CLIENT_SECRET
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:4000/api/auth/oauth/facebook/callback'

    if (!clientId || !clientSecret) throw new Error('Missing Facebook credentials')

    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${encodeURIComponent(code)}`
    const tokenRes = await fetch(tokenUrl)
    const tokenJson = await tokenRes.json()
    
    if (!tokenRes.ok) {
        console.error('[Facebook OAuth] Token Error:', tokenJson)
        throw new Error(tokenJson.error?.message || 'facebook token error')
    }

    const userRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenJson.access_token}`)
    const profile = await userRes.json()
    
    if (!userRes.ok) {
        console.error('[Facebook OAuth] Profile Error:', profile)
        throw new Error('Failed to fetch user profile')
    }

    const email = profile.email || `facebook-${profile.id}@oauth.local`
    const name = profile.name || 'Facebook User'
    const avatar = profile.picture?.data?.url || ''

    let user = await User.findOne({ email })
    if (!user) {
      user = await User.create({ email, name, passwordHash: '__oauth_facebook__', avatar })
    }
    const token = sign(user)
    
    const redirectUrl = new URL(target)
    redirectUrl.searchParams.set('token', token)
    return res.redirect(redirectUrl.toString())

  } catch (err) {
    console.error('[Facebook OAuth] Exception:', err)
    return redirectError(res, target, 'oauth_failed')
  }
})

export default router
