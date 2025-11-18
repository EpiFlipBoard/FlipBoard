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
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">Epi-Flipboard</Link>
        <nav className="flex gap-4 text-sm items-center">
          <NavLink to="/" end className={({isActive}) => isActive ? 'text-blue-600 font-medium' : 'text-gray-600'}>Home</NavLink>
          <NavLink to="/favorites" className={({isActive}) => isActive ? 'text-blue-600 font-medium' : 'text-gray-600'}>Favorites</NavLink>
          <NavLink to="/search" className={({isActive}) => isActive ? 'text-blue-600 font-medium' : 'text-gray-600'}>Search</NavLink>
          <NavLink to="/admin" className={({isActive}) => isActive ? 'text-blue-600 font-medium' : 'text-gray-600'}>Admin</NavLink>
          {user ? (
            <div className="relative">
              <button onClick={() => setOpen(!open)} className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <span className="text-sm font-semibold">{initial}</span>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow p-3">
                  <div className="text-sm mb-2">Disconnect?</div>
                  <div className="flex gap-2">
                    <button className="px-2 py-1 rounded bg-gray-200" onClick={() => setOpen(false)}>Cancel</button>
                    <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={onLogout}>Disconnect</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className={({isActive}) => isActive ? 'text-blue-600 font-medium' : 'text-gray-600'}>Login / Register</NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}

export default NavBar