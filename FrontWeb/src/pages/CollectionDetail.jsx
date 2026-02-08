import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authFetch } from '../lib/auth.js'
import { API_URL } from '../config.js'

function CollectionDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [collection, setCollection] = useState(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  async function load() {
    const res = await authFetch(`${API_URL}/api/collections/${id}`)
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
    const res = await authFetch(`${API_URL}/api/collections/${id}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId })
    })
    if (res.ok) {
      load() // Reload collection to show new post
      setResults(prev => prev.filter(p => p._id !== postId)) // Remove from results or just keep? User said "click on article to add it", implies it moves or status changes. Reloading is safe.
      alert(t('collection_detail.added_success'))
    }
  }

  if (!collection) return <div className="p-10 text-center text-gray-900 dark:text-white">{t('collection_detail.loading')}</div>

  return (
    <div className="min-h-screen bg-white dark:bg-brand-dark text-gray-900 dark:text-white pb-20">
      <div className="bg-gray-100 dark:bg-black/40 py-12 px-6 text-center border-b border-gray-200 dark:border-white/5">
        <h1 className="text-4xl font-bold mb-4">{collection.name}</h1>
        {collection.description && <p className="text-gray-600 dark:text-white/80 max-w-2xl mx-auto">{collection.description}</p>}
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">{t('collection_detail.add_articles')}</h2>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('collection_detail.search_placeholder')} 
              className="flex-1 p-3 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
            <button type="submit" className="btn btn-primary px-6">{t('collection_detail.search_button')}</button>
          </form>

          {results.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              {results.map(post => (
                <div key={post._id} className="bg-white dark:bg-gray-800 rounded shadow p-4 flex gap-4 cursor-pointer hover:ring-2 hover:ring-brand-red transition-all" onClick={() => addToCollection(post._id)}>
                  {post.imageUrl && <img src={post.imageUrl} alt="" className="w-20 h-20 object-cover rounded" />}
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold truncate">{post.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{post.author}</p>
                    <button className="mt-2 text-xs text-brand-red font-semibold uppercase tracking-wide">{t('collection_detail.add_button')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold mb-6">{t('collection_detail.articles_in_collection')}</h2>
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
              {t('collection_detail.empty_collection')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CollectionDetail
