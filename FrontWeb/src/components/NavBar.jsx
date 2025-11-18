import { Link, NavLink, useLocation } from 'react-router-dom'
import { getUser, getUserInitial } from '../lib/auth.js'

function NavBar() {
  const loc = useLocation()
  const user = getUser()
  const initial = getUserInitial(user)
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
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <span className="text-sm font-semibold">{initial}</span>
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