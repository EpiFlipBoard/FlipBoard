import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { setAuth, getUser, clearAuth, authFetch } from '../lib/auth.js'
import { API_URL } from '../config.js'
import { useTheme } from './ThemeProvider.jsx'

function NavBar() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [q, setQ] = useState('')
  const [authOpen, setAuthOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileMenuRef = useRef(null)
  const [mode, setMode] = useState('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState('')
  const { theme, toggleTheme } = useTheme()
  const user = getUser()

  // Notification Polling
  useEffect(() => {
    if (!user) return

    let lastCheck = new Date().toISOString()
    const interval = setInterval(async () => {
      try {
        const res = await authFetch(`${API_URL}/api/users/me/notifications/check?since=${lastCheck}`)
        if (res.ok) {
          const data = await res.json()
          if (data.newPosts > 0) {
            // Play sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
            audio.volume = 0.5
            audio.play().catch(e => console.error('Audio play failed', e))
            
            // Reset timer to avoid spamming for the same posts
            lastCheck = new Date().toISOString()
          }
        }
      } catch (e) {
        console.error('Notification check failed', e)
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [user?.email]) // Re-run if user changes

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('fr') ? 'en' : 'fr'
    i18n.changeLanguage(newLang)
  }

  useEffect(() => {
    if (location.pathname === '/login') {
      setMode('login')
      setAuthOpen(true)
    } else if (location.pathname === '/signup') {
      setMode('register')
      setAuthOpen(true)
    }
  }, [location.pathname])
  function goSearch() {
    const s = q.trim()
    if (s) navigate(`/search?q=${encodeURIComponent(s)}`)
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const error = params.get('error')

    if (error) {
      setAuthOpen(true)
      setMode('login')
      setLoginError(error === 'missing_configuration' ? t('auth.missing_configuration') : t('auth.oauth_failed'))
      navigate(location.pathname, { replace: true })
    }

    async function handleToken() {
      if (!token) return
      const res = await authFetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` } // Ensure token is passed
      })
      const data = await res.json()
      if (res.ok && data?.user) {
        setAuth(token, data.user)
        setAuthOpen(false)
        navigate(location.pathname, { replace: true })
        window.location.reload()
      }
    }
    handleToken()
  }, [location.search])

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileOpen])

  async function onLogin(e) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.toLowerCase(), password: loginPassword })
      })
      const data = await res.json()
      if (!res.ok) { throw new Error(data?.error || t('auth.login_failed')) }
      setAuth(data.token, data.user)
      setAuthOpen(false)
      navigate('/', { replace: true })
      window.location.reload()
    } catch (err) {
      setLoginError(err.message)
    } finally {
      setLoginLoading(false)
    }
  }

  async function onRegister(e) {
    e.preventDefault()
    setRegError('')
    setRegLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail.toLowerCase(), password: regPassword })
      })
      const data = await res.json()
      if (!res.ok) { throw new Error(data?.error || t('auth.register_failed')) }
      setAuth(data.token, data.user)
      setAuthOpen(false)
      navigate('/', { replace: true })
      window.location.reload()
    } catch (err) {
      setRegError(err.message)
    } finally {
      setRegLoading(false)
    }
  }
  return (
    <header className={`sticky top-0 z-40 bg-white dark:bg-brand-dark shadow border-b border-gray-200 dark:border-brand-blue transition-colors duration-200 ${user ? '' : 'py-3'}`}>
      <div className="mr-10 flex items-center justify-between">
        {user ? (
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="h-16 w-16" />
            </Link>
            <Link to="/" className="nav-link text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white">
              {t('nav.home')}
            </Link>
          </div>
        ) : (
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">EPI-FLIPBOARD</span>
          </Link>
        )}
        <nav className="flex gap-6 text-sm items-center">
          <button onClick={toggleLanguage} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white transition-colors font-medium">
            {i18n.language.startsWith('fr') ? 'EN' : 'FR'}
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white transition-colors" title={theme === 'dark' ? t('nav.dark_mode') : t('nav.dark_mode')}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user ? (
            <>
              <div className="hidden md:flex items-center">
                <input
                  value={q}
                  onChange={e=>setQ(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter') goSearch() }}
                  placeholder={t('nav.search_placeholder')}
                  className="search-input bg-gray-100 dark:bg-black/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 border-gray-200 dark:border-white/10 focus:ring-brand-red"
                />
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/create')}>{t('nav.create_article')}</button>
              <button className="nav-link text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white" title={t('nav.following')} onClick={() => navigate('/follows')}>{t('nav.following')}</button>
              <div className="relative" ref={profileMenuRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-white/40 hover:ring-brand-red transition-all duration-200">
                  <img src={user?.avatarUrl || '/nopfp.jpg'} alt="pfp" className="h-full w-full object-cover" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl profile-menu-enter">
                    <div className="flex flex-col p-1">
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-150" onClick={() => { setProfileOpen(false); navigate('/profile') }}>{t('nav.account')}</button>
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-150" onClick={() => { setProfileOpen(false); navigate('/settings') }}>{t('nav.settings')}</button>
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center justify-between transition-colors duration-150" onClick={toggleTheme}>
                        <span>{t('nav.dark_mode')}</span>
                        {theme === 'dark' && <span className="text-brand-red">✓</span>}
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <button className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md transition-colors duration-150" onClick={() => { clearAuth(); setProfileOpen(false); navigate('/'); window.location.reload() }}>{t('nav.logout')}</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink to="/newsletter" className={({isActive}) => isActive ? 'nav-link-active text-gray-900 dark:text-white' : 'nav-link text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white'}>{t('nav.newsletter')}</NavLink>
              <div className="hidden md:flex items-center">
                <input
                  value={q}
                  onChange={e=>setQ(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter') goSearch() }}
                  placeholder={t('nav.search_placeholder')}
                  className="search-input bg-gray-100 dark:bg-black/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 border-gray-200 dark:border-white/10 focus:ring-brand-red"
                />
              </div>
              <button className="nav-link btn btn-primary" onClick={() => navigate('/signup')}>{t('nav.signup')}</button>
              <button className="nav-link text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white" onClick={() => navigate('/login')}>{t('nav.login')}</button>
            </>
          )}
        </nav>
      </div>
    
    {authOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-brand-dark text-gray-900 dark:text-white rounded-xl shadow-magazine w-full max-w-3xl overflow-hidden transition-colors duration-200">
          <div className="flex">
            <div className="hidden md:block bg-gray-100 dark:bg-black/40 p-6">
              <div className="flex items-center mb-4 px-4">
                <img src="/logo.png" alt="Logo" className="h-40 w-40 rounded" />
              </div>
                <div className="text-lg font-bold">EPI-FLIPBOARD</div>
              <div className="space-y-3 text-sm text-gray-600 dark:text-white/80">
                <div>{t('nav.brand_slogan')}</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-blue" />{t('nav.follow_topics')}</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-blue" />{t('nav.curate_stories')}</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-blue" />{t('nav.share_ideas')}</div>
              </div>
            </div>
            <div className="flex-1 p-8">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">{mode === 'login' ? t('auth.login_title') : t('auth.register_title')}</h2>
                <button onClick={() => { setAuthOpen(false); if (location.pathname === '/login' || location.pathname === '/signup') navigate('/', { replace: true }) }} className="text-gray-500 hover:text-gray-900 dark:text-white/70 dark:hover:text-white">✕</button>
              </div>

              {mode === 'login' ? (
                <form className="mt-4 space-y-3" onSubmit={onLogin}>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      className="btn btn-muted w-full"
                      onClick={() => (window.location.href = `${API_URL}/api/auth/oauth/google?origin=${encodeURIComponent(window.location.origin)}`)}
                    >Google</button>
                  </div>
                  <input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder={t('auth.email_label')} className="w-full bg-gray-100 dark:bg-black/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/60 border border-gray-200 dark:border-white/10 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red" />
                  <input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} placeholder={t('auth.password_label')} className="w-full bg-gray-100 dark:bg-black/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/60 border border-gray-200 dark:border-white/10 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red" />
                  <button disabled={loginLoading} type="submit" className="w-full btn btn-primary">{loginLoading ? t('auth.logging_in') : t('auth.login_button')}</button>
                  {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
                  <div className="text-sm text-gray-600 dark:text-white/70 mt-2">{t('auth.no_account')} <button type="button" className="underline" onClick={() => setMode('register')}>{t('auth.signup_link')}</button></div>
                </form>
              ) : (
                <form className="mt-4 space-y-3" onSubmit={onRegister}>
                  <input type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder={t('auth.email_label')} className="w-full bg-gray-100 dark:bg-black/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/60 border border-gray-200 dark:border-white/10 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red" />
                  <input type="text" value={regName} onChange={e=>setRegName(e.target.value)} placeholder={t('auth.name_label')} className="w-full bg-gray-100 dark:bg-black/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/60 border border-gray-200 dark:border-white/10 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red" />
                  <input type="password" value={regPassword} onChange={e=>setRegPassword(e.target.value)} placeholder={t('auth.password_label')} className="w-full bg-gray-100 dark:bg-black/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/60 border border-gray-200 dark:border-white/10 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red" />
                  <button disabled={regLoading} type="submit" className="w-full btn btn-primary">{regLoading ? t('auth.creating') : t('auth.continue')}</button>
                  {regError && <p className="text-red-400 text-sm">{regError}</p>}
                  <div className="text-sm text-gray-600 dark:text-white/70 mt-2">{t('auth.has_account')} <button type="button" className="underline" onClick={() => setMode('login')}>{t('auth.login_link')}</button></div>
                </form>
              )}
              <p className="text-xs text-gray-500 dark:text-white/50 mt-6">{t('auth.terms_privacy')}</p>
            </div>
          </div>
        </div>
      </div>
    )}
    </header>
  )
}

export default NavBar
