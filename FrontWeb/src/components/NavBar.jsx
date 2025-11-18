import { Link, NavLink } from 'react-router-dom'

function NavBar() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">Epi-Flipboard</Link>
        <nav className="flex gap-4 text-sm">
          <NavLink to="/" end className={({isActive}) => isActive ? 'text-blue-600 font-medium' : 'text-gray-600'}>Home</NavLink>
          <NavLink to="/favorites" className={({isActive}) => isActive ? 'text-blue-600 font-medium' : 'text-gray-600'}>Favorites</NavLink>
          <NavLink to="/search" className={({isActive}) => isActive ? 'text-blue-600 font-medium' : 'text-gray-600'}>Search</NavLink>
          <NavLink to="/admin" className={({isActive}) => isActive ? 'text-blue-600 font-medium' : 'text-gray-600'}>Admin</NavLink>
          <NavLink to="/login" className={({isActive}) => isActive ? 'text-blue-600 font-medium' : 'text-gray-600'}>Login</NavLink>
        </nav>
      </div>
    </header>
  )
}

export default NavBar