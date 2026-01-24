import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toggleFavorite, getFavorites } from '../lib/storage.js'
import { getToken, getUser } from '../lib/auth.js'
import { API_URL } from '../config.js'
import Comments from '../components/Comments.jsx'

const sample = []

function Home() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState(getFavorites())
  const favIds = useMemo(() => new Set(favorites.map(a => a.id)), [favorites])
  const categories = ['Explore Spotlight','Inédit','Actualités','Local','Économie','Tech et sciences','Sport']
  const [selected, setSelected] = useState('Explore Spotlight')
  const user = getUser()
  const [activeCommentPostId, setActiveCommentPostId] = useState(null)

  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`http://localhost:4000/api/posts?page=${page}&limit=12`)
        const data = await res.json()
        const mapped = (data.posts || []).map(p => ({
          id: p._id,
          title: p.title,
          source: p.author,
          authorId: p.authorId,
          summary: p.description,
          category: p.type,
          imageUrl: p.imageUrl,
          likes: p.likes || 0,
          url: p.url,
        }))
        setPosts(prev => page === 1 ? mapped : [...prev, ...mapped])
        setHasMore(data.hasMore)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page])

  useEffect(() => {
    function handleScroll() {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.scrollHeight - 5) {
        if (!loading && hasMore) {
          setPage(prev => prev + 1)
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading, hasMore])

  return (
    <div>
      <section className="text-center pt-28 bg-brand-dark text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-6xl font-extrabold leading-tight">RESTEZ INFORMÉS<br/>TROUVEZ DE L'INSPIRATION</h1>
          <div className="h-3 bg-brand-blue w-full mx-auto my-4" />
          <p className="text-white/80 text-2xl">Histoires sélectionnées pour vous</p>
          {!user && <Link to="/signup" className="mt-12 mb-20 inline-flex btn btn-primary text-lg px-8 py-4">Créer un compte</Link>}
          {user && <Link to="/create" className="mt-8 inline-flex btn btn-primary text-lg px-8 py-3">Créer un article</Link>}
        </div>
      </section>

      <div className={`max-w-6xl mx-auto px-4${user ? ' mt-10' : ''}`}>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {posts.map(a => (
            <article
              key={a.id}
              className="rounded-xl overflow-hidden shadow-magazine cursor-pointer bg-white flex flex-col h-full"
              onClick={() => { 
                if (a.url) window.open(a.url, '_blank', 'noopener,noreferrer') 
                else navigate(`/article/${a.id}`)
              }}
            >
              <img src={a.imageUrl} alt={a.title} className="w-full h-56 object-cover" />
              <div className="p-4 flex flex-col flex-1">
                <div className="text-xs uppercase tracking-wide text-gray-500">{a.category}</div>
                <h2 className="text-xl font-bold text-gray-900 mt-1 break-words">{a.title}</h2>
                <div 
                  className="text-sm text-gray-600 hover:text-brand-red hover:underline"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Use authorId if available, otherwise use source name
                    const target = a.authorId || a.source
                    navigate(`/author/${encodeURIComponent(target)}`)
                  }}
                >
                  {a.source}
                </div>
                <p className="mt-2 text-sm text-gray-700 break-words">{a.summary}</p>
                <div className="mt-auto pt-4 flex items-center gap-3">
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      const token = getToken()
                      const res = await fetch(`${API_URL}/api/posts/${a.id}/like`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } })
                      const data = await res.json()
                      if (res.ok) setPosts(prev => prev.map(p => p.id === a.id ? { ...p, likes: data.likes } : p))
                    }}
                    className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                    title="Like"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.13 2.44C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    <span>{a.likes}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveCommentPostId(a.id)
                    }}
                    className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                    title="Comments"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6h-18v12h4v4l4-4h10z"/></svg>
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      const token = getToken()
                      await fetch(`${API_URL}/api/posts/${a.id}/collect`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
                      alert('Ajouté à votre collection')
                    }}
                    className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                    title="Add to collection"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3zm0 4h12v2H3zm0 4h18v2H3zm0 4h12v2H3z"/></svg>
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      const url = a.url || `${window.location.origin}`
                      if (navigator.share) { try { await navigator.share({ title: a.title, text: a.summary, url }) } catch {} } else { await navigator.clipboard.writeText(url); alert('Lien copié') }
                    }}
                    className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                    title="Share"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.02-4.11C16.56 7.62 17.24 7.92 18 7.92c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.07 9.63C7.56 9.16 6.88 8.86 6.12 8.86c-1.66 0-3 1.34-3 3s1.34 3 3 3c.76 0 1.44-.3 1.95-.77l7.14 4.16c-.05.21-.09.43-.09.65 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z"/></svg>
                  </button>
                  {a.url ? (
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto btn btn-primary"
                      onClick={(e) => e.stopPropagation()}
                    >Lire à la source</a>
                  ) : (
                    <Link
                      to={`/article/${a.id}`}
                      className="ml-auto btn btn-primary"
                      onClick={(e) => e.stopPropagation()}
                    >Lire l'article</Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
        {loading && <div className="text-center pb-10 text-gray-500">Chargement...</div>}
      </div>
      
      {activeCommentPostId && (
        <Comments 
          postId={activeCommentPostId} 
          isPopup={true} 
          onClose={() => setActiveCommentPostId(null)} 
        />
      )}
    </div>
  )
}

export default Home
