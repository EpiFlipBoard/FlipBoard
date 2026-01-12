import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getToken } from '../lib/auth.js'

function Search() {
  const location = useLocation()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('title')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const urlQ = params.get('q') || ''
    
    if (q !== urlQ) {
      const timer = setTimeout(() => {
        navigate(`/search?q=${encodeURIComponent(q)}&filter=${filter}`, { replace: true })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [q, filter, navigate, location.search])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const query = params.get('q') || ''
    const type = params.get('filter') || 'title'
    setQ(query)
    setFilter(type)
    
    if (query.trim()) {
      setLoading(true)
      fetch(`http://localhost:4000/api/posts/search?q=${encodeURIComponent(query)}&filter=${type}`)
        .then(res => res.json())
        .then(data => {
          setResults(data.posts || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setResults([])
    }
  }, [location.search])

  function handleFilterChange(newFilter) {
    setFilter(newFilter)
    navigate(`/search?q=${encodeURIComponent(q)}&filter=${newFilter}`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-white">Recherche</h1>
      <div className="mb-10 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Rechercher des articles..."
            className="w-full bg-black/40 text-white border border-white/20 rounded-lg px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-brand-red placeholder-white/50"
          />
        </div>
        <div className="flex items-center gap-4 bg-black/40 border border-white/20 rounded-lg px-4">
          <label className="flex items-center gap-2 cursor-pointer text-white">
            <input 
              type="radio" 
              name="filter" 
              value="title" 
              checked={filter === 'title'} 
              onChange={() => handleFilterChange('title')}
              className="accent-brand-red w-5 h-5"
            />
            <span>Titre</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-white">
            <input 
              type="radio" 
              name="filter" 
              value="author" 
              checked={filter === 'author'} 
              onChange={() => handleFilterChange('author')}
              className="accent-brand-red w-5 h-5"
            />
            <span>Auteur</span>
          </label>
        </div>
      </div>

      {loading && <div className="text-white text-center py-10">Recherche en cours...</div>}
      
      {!loading && results.length === 0 && q && (
        <div className="text-white/70 text-lg">Aucun résultat trouvé pour "{q}"</div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map(a => (
          <article
            key={a._id}
            className="rounded-xl overflow-hidden shadow-magazine cursor-pointer bg-white flex flex-col h-full hover:-translate-y-1 transition-transform duration-300"
            onClick={() => { 
              if (a.url) window.open(a.url, '_blank', 'noopener,noreferrer') 
              else navigate(`/article/${a._id}`)
            }}
          >
            {a.imageUrl && (
              <img src={a.imageUrl} alt={a.title} className="w-full h-56 object-cover" />
            )}
            {!a.imageUrl && (
              <div className="h-56 bg-gradient-to-br from-brand-red to-pink-600 flex items-center justify-center">
                <span className="text-white font-bold text-2xl opacity-50">EPI-FLIP</span>
              </div>
            )}
            <div className="p-5 flex flex-col flex-1">
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">{a.type || 'Article'}</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight break-words">{a.title}</h2>
              {a.author && <div className="text-sm text-brand-red font-semibold mb-2">{a.author}</div>}
              <p className="text-sm text-gray-600 mb-4 line-clamp-3 break-words flex-1">{a.description || a.summary}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</span>
                {a.url ? (
                   <a
                     href={a.url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="btn btn-primary text-xs px-3 py-1.5"
                     onClick={(e) => e.stopPropagation()}
                   >
                     Lire à la source
                   </a>
                ) : (
                  <Link 
                    to={`/article/${a._id}`}
                    className="btn btn-primary text-xs px-3 py-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Lire l'article
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Search
