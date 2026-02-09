import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { getToken, authFetch } from '../lib/auth.js'
import { API_URL } from '../config.js'

function Author() {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  const token = getToken()

  useEffect(() => {
    fetchAuthor()
  }, [id])

  async function fetchAuthor() {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`)
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        setPosts(data.posts)
        
        if (token) {
           fetchMyProfile(data.user._id)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function fetchMyProfile(targetId) {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok && data.user) {
        setIsFollowing(data.user.following.includes(targetId))
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function toggleFollow() {
    if (!token) return alert(t('author.login_to_follow'))
    
    try {
      const res = await authFetch(`${API_URL}/api/users/${id}/follow`, {
        method: 'POST'
      })
      const data = await res.json()
      if (res.ok) {
        setIsFollowing(data.following)
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <div className="text-gray-900 dark:text-white p-8">{t('author.loading')}</div>
  if (!user) return <div className="text-gray-900 dark:text-white p-8">{t('author.not_found')}</div>

  return (
    <div className="text-gray-900 dark:text-white max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-6 mb-12 bg-gray-100 dark:bg-white/5 p-8 rounded-xl border border-gray-200 dark:border-white/10">
        <div className="w-24 h-24 bg-brand-red rounded-full flex items-center justify-center text-3xl font-bold uppercase overflow-hidden text-white">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.name[0]
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user.isSource ? t('author.external_source') : t('author.member_since', { year: new Date(user.createdAt).getFullYear() })}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={toggleFollow}
            className={`px-6 py-2 rounded-full font-bold transition ${
              isFollowing 
                ? 'bg-white/10 text-white hover:bg-white/20' 
                : 'bg-brand-red text-white hover:bg-red-700'
            }`}
          >
            {isFollowing ? t('author.following') : t('author.follow')}
          </button>
        </div>
      </div>

      {/* Posts */}
      <h2 className="text-2xl font-bold mb-6">{t('author.published_articles')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length > 0 ? (
          posts.map(post => (
            <a key={post._id} href={`/article/${post._id}`} className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition group border border-white/10">
              {post.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-brand-red transition">{post.title}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">{post.description}</p>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: i18n.language === 'fr' ? fr : enUS })}
                </div>
              </div>
            </a>
          ))
        ) : (
          <p className="text-gray-400 col-span-full">{t('author.no_articles')}</p>
        )}
      </div>
    </div>
  )
}

export default Author