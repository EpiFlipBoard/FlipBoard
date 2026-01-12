import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { setAuth, getUser, clearAuth } from '../lib/auth.js'

function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [q, setQ] = useState('')
  const [authOpen, setAuthOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
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
  const [menuOpen, setMenuOpen] = useState(false)
  const user = getUser()
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
    async function handleToken() {
      if (!token) return
      const res = await fetch('http://localhost:4000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
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

  async function onLogin(e) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.toLowerCase(), password: loginPassword })
      })
      const data = await res.json()
      if (!res.ok) { throw new Error(data?.error || 'Login failed') }
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
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail.toLowerCase(), password: regPassword })
      })
      const data = await res.json()
      if (!res.ok) { throw new Error(data?.error || 'Register failed') }
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
    <header className={`sticky top-0 z-40 bg-brand-dark shadow border-b border-brand-blue ${user ? '' : 'py-3'}`}>
      <div className="mr-10 flex items-center justify-between">
        {user ? (
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="h-16 w-16" />
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <button className="nav-link">For you</button>
            </Link>
            <button className="nav-link">Today's edition</button>
            <div className="relative">
              <button className="nav-link" onClick={() => setMenuOpen(!menuOpen)}>▼</button>
              {menuOpen && (
                <div className="absolute mt-2 w-40 bg-white text-brand-dark rounded shadow p-2">
                  <button className="w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Modify</button>
                  <button className="w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Explore more</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded" />
            <span className="text-xl font-bold text-white">EPI-FLIPBOARD</span>
          </Link>
        )}
        <nav className="flex gap-6 text-sm items-center">
          {user ? (
            <>
              <div className="hidden md:flex items-center">
                <input
                  value={q}
                  onChange={e=>setQ(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter') goSearch() }}
                  placeholder="Search on EPI-Flipboard"
                  className="search-input"
                />
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/create')}>Create an article</button>
              <button className="nav-link" title="Follows" onClick={() => navigate('/follows')}>Follows</button>
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)} className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-white/40">
                  <img src={user?.avatarUrl || '/nopfp.jpg'} alt="pfp" className="h-full w-full object-cover" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow p-2">
                    <div className="flex flex-col">
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded" onClick={() => { setProfileOpen(false); navigate('/profile') }}>Account</button>
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded" onClick={() => { setProfileOpen(false); navigate('/statistics') }}>Statistics</button>
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded" onClick={() => { setProfileOpen(false); navigate('/settings') }}>Settings</button>
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center justify-between">
                        <span>Dark Mode</span>
                        <span className="text-red-500">✓</span>
                      </button>
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded" onClick={() => { clearAuth(); setProfileOpen(false); navigate('/'); window.location.reload() }}>Disconnect</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink to="/newsletter" className={({isActive}) => isActive ? 'nav-link-active' : 'nav-link'}>Newsletter</NavLink>
              <div className="hidden md:flex items-center">
                <input
                  value={q}
                  onChange={e=>setQ(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter') goSearch() }}
                  placeholder="Search on EPI-Flipboard"
                  className="search-input"
                />
              </div>
              <button className="nav-link btn btn-primary" onClick={() => navigate('/signup')}>Register</button>
              <button className="nav-link" onClick={() => navigate('/login')}>Login</button>
            </>
          )}
        </nav>
      </div>
    
    {authOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-brand-dark text-white rounded-xl shadow-magazine w-full max-w-3xl overflow-hidden">
          <div className="flex">
            <div className="hidden md:block  bg-black/40 p-6">
              <div className="flex items-center mb-4 px-4">
                <img src="/logo.png" alt="Logo" className="h-40 w-40 rounded" />
              </div>
                <div className="text-lg font-bold">EPI-FLIPBOARD</div>
              <div className="space-y-3 text-sm text-white/80">
                <div>Restez informé. Toujours inspiré.</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-blue" />Suivre des sujets</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-blue" />Sélectionnez des histoires</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-blue" />Partagez des idées</div>
              </div>
            </div>
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">{mode === 'login' ? 'Se connecter à EPI-FLIPBOARD' : 'Rejoignez EPI-FLIPBOARD'}</h2>
                <button onClick={() => { setAuthOpen(false); if (location.pathname === '/login' || location.pathname === '/signup') navigate('/', { replace: true }) }} className="text-white/70 hover:text-white">✕</button>
              </div>

              {mode === 'login' ? (
                <form className="mt-4 space-y-3" onSubmit={onLogin}>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      className="btn btn-muted"
                      onClick={() => (window.location.href = `http://localhost:4000/api/auth/oauth/google?origin=${encodeURIComponent(window.location.origin)}`)}
                    >Google</button>
                    <button
                      type="button"
                      className="btn btn-muted"
                      onClick={() => (window.location.href = `http://localhost:4000/api/auth/oauth/facebook?origin=${encodeURIComponent(window.location.origin)}`)}
                    >Facebook</button>
                  </div>
                  <input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="Email" className="w-full bg-black/40 text-white placeholder-white/60 border border-white/10 rounded px-3 py-2" />
                  <input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} placeholder="Mot de passe" className="w-full bg-black/40 text-white placeholder-white/60 border border-white/10 rounded px-3 py-2" />
                  <button disabled={loginLoading} type="submit" className="w-full btn btn-primary">{loginLoading ? 'Connexion…' : 'Se connecter'}</button>
                  {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
                  <div className="text-sm text-white/70 mt-2">Nouveau sur EPI-FLIPBOARD ? <button type="button" className="underline" onClick={() => setMode('register')}>Créer un compte</button></div>
                </form>
              ) : (
                <form className="mt-4 space-y-3" onSubmit={onRegister}>
                  <input type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="Email" className="w-full bg-black/40 text-white placeholder-white/60 border border-white/10 rounded px-3 py-2" />
                  <input type="text" value={regName} onChange={e=>setRegName(e.target.value)} placeholder="Nom complet" className="w-full bg-black/40 text-white placeholder-white/60 border border-white/10 rounded px-3 py-2" />
                  <input type="password" value={regPassword} onChange={e=>setRegPassword(e.target.value)} placeholder="Mot de passe" className="w-full bg-black/40 text-white placeholder-white/60 border border-white/10 rounded px-3 py-2" />
                  <button disabled={regLoading} type="submit" className="w-full btn btn-primary">{regLoading ? 'Création…' : 'Continuer'}</button>
                  {regError && <p className="text-red-400 text-sm">{regError}</p>}
                  <div className="text-sm text-white/70 mt-2">Vous avez déjà un compte ? <button type="button" className="underline" onClick={() => setMode('login')}>Se connecter</button></div>
                </form>
              )}
              <p className="text-xs text-white/50 mt-6">En continuant, vous acceptez les Conditions d'utilisation et Politique de confidentialité.</p>
            </div>
          </div>
        </div>
      </div>
    )}
    </header>
  )
}

export default NavBar
