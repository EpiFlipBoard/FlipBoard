import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { getUser, getUserInitial, clearAuth } from '../lib/auth.js'
import { useState } from 'react'

function NavBar() {
  const loc = useLocation()
  const navigate = useNavigate()
  const user = getUser()
  const initial = getUserInitial(user)
  const [open, setOpen] = useState(false)

  function onLogout() {
    clearAuth()
    setOpen(false)
    navigate('/login')
  }
  return (
    <header className="sticky top-0 z-40 bg-brand-red shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white">Epi-Flipboard</Link>
        <nav className="flex gap-6 text-sm items-center">
          <NavLink to="/" end className={({isActive}) => isActive ? 'nav-link-active' : 'nav-link'}>Home</NavLink>
          <NavLink to="/favorites" className={({isActive}) => isActive ? 'nav-link-active' : 'nav-link'}>Favorites</NavLink>
          <NavLink to="/search" className={({isActive}) => isActive ? 'nav-link-active' : 'nav-link'}>Search</NavLink>
          <NavLink to="/admin" className={({isActive}) => isActive ? 'nav-link-active' : 'nav-link'}>Admin</NavLink>
          {user ? (
            <div className="relative">
              <button onClick={() => setOpen(!open)} className="h-9 w-9 rounded-full bg-white text-brand-red flex items-center justify-center ring-2 ring-white/40">
                <span className="text-sm font-semibold">{initial}</span>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow p-3">
                  <div className="text-sm mb-2">Disconnect?</div>
                  <div className="flex gap-2">
                    <button className="btn btn-muted" onClick={() => setOpen(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={onLogout}>Disconnect</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className={({isActive}) => isActive ? 'nav-link-active' : 'nav-link'}>Login / Register</NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}

export default NavBar