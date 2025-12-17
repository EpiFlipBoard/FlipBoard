import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getToken } from '../lib/auth.js'
import { API_URL } from '../config.js'

function CollectionDetail() {
  const { id } = useParams()
  const [collection, setCollection] = useState(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  async function load() {
    const token = getToken()
    const res = await fetch(`${API_URL}/api/collections/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (res.ok) setCollection(data.collection)
  }

  useEffect(() => { load() }, [id])

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setIsSearching(true)
    const res = await fetch(`${API_URL}/api/posts/search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setResults(data.posts || [])
    setIsSearching(false)
  }

  async function addToCollection(postId) {
    const token = getToken()
    const res = await fetch(`${API_URL}/api/collections/${id}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ postId })
    })
    if (res.ok) {
      load() // Reload collection to show new post
      setResults(prev => prev.filter(p => p._id !== postId)) // Remove from results or just keep? User said "click on article to add it", implies it moves or status changes. Reloading is safe.
      alert('Article ajouté à la collection')
    }
  }

  if (!collection) return <div className="p-10 text-center text-white">Chargement...</div>

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-black dark:text-white pb-20">
      <div className="bg-brand-dark py-12 px-6 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">{collection.name}</h1>
        {collection.description && <p className="text-white/80 max-w-2xl mx-auto">{collection.description}</p>}
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Ajouter des articles</h2>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un article..." 
              className="flex-1 p-3 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
            <button type="submit" className="btn btn-primary px-6">Rechercher</button>
          </form>

          {results.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              {results.map(post => (
                <div key={post._id} className="bg-white dark:bg-gray-800 rounded shadow p-4 flex gap-4 cursor-pointer hover:ring-2 hover:ring-brand-red transition-all" onClick={() => addToCollection(post._id)}>
                  {post.imageUrl && <img src={post.imageUrl} alt="" className="w-20 h-20 object-cover rounded" />}
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold truncate">{post.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{post.author}</p>
                    <button className="mt-2 text-xs text-brand-red font-semibold uppercase tracking-wide">Ajouter +</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold mb-6">Articles dans cette collection</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collection.posts && collection.posts.map(post => (
             <article key={post._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
               {post.imageUrl && (
                 <a href={post.url} target="_blank" rel="noopener noreferrer" className="block h-48 overflow-hidden">
                   <img src={post.imageUrl} alt="" className="w-full h-full object-cover transition-transform hover:scale-105" />
                 </a>
               )}
               <div className="p-5 flex flex-col flex-1">
                 <div className="flex items-center gap-2 mb-3">
                   {post.author && <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{post.author}</span>}
                 </div>
                 <h3 className="text-xl font-bold mb-3 leading-tight">
                   <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-red transition-colors">
                     {post.title}
                   </a>
                 </h3>
                 {post.description && <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-1">{post.description}</p>}
               </div>
             </article>
          ))}
          {!collection.posts?.length && (
            <div className="col-span-full text-center py-10 text-gray-500">
              Cette collection est vide. Recherchez des articles ci-dessus pour les ajouter.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CollectionDetail
