import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function NavBar() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  function goSearch() {
    const s = q.trim()
    if (s) navigate(`/search?q=${encodeURIComponent(s)}`)
  }
  return (
    <header className="sticky top-0 z-40 bg-brand-dark shadow border-b border-brand-blue">
      <div className="mx-10 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded" />
          <span className="text-xl font-bold text-white">EPI-FLIPBOARD</span>
        </Link>
        <nav className="flex gap-6 text-sm items-center">
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
          <NavLink to="/login" className={`btn btn-primary ${({isActive}) => isActive ? 'nav-link-active' : 'nav-link'}`}>Login</NavLink>
          <NavLink to="/login" className={({isActive}) => isActive ? 'nav-link-active' : 'nav-link'}>Register</NavLink>
        </nav>
      </div>
    </header>
  )
}

export default NavBar
