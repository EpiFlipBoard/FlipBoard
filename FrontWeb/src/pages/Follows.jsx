import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authFetch, getToken } from '../lib/auth.js'
import { API_URL } from '../config.js'

function Follows() {
  const { t } = useTranslation()
  const tabs = ['Following', 'Likes', 'Comments']
  const [activeTab, setActiveTab] = useState('Following')
  const [data, setData] = useState({ liked: [], commented: [], following: [], followedUsers: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivity()
  }, [])

  async function fetchActivity() {
    try {
      const res = await authFetch(`${API_URL}/api/users/me/activity`)
      if (res.ok) {
        const d = await res.json()
        setData(d)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-gray-900 dark:text-white text-center py-20">{t('follows.loading')}</div>
  
  if (!getToken()) {
     return (
       <div className="text-gray-900 dark:text-white text-center py-20">
         <h2 className="text-2xl font-bold mb-4">{t('follows.login_title')}</h2>
         <Link to="/login" className="btn btn-primary">{t('follows.login_button')}</Link>
       </div>
     )
  }

  return (
    <div className="text-gray-900 dark:text-white py-8 max-w-6xl mx-auto px-4">
      <h1 className="text-4xl font-extrabold text-center mb-8">{t('follows.header')}</h1>
      
      <div className="flex justify-center gap-8 border-b border-gray-200 dark:border-white/10 pb-4 mb-8">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-lg font-bold pb-4 border-b-2 transition ${
              activeTab === tab ? 'border-brand-red text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab === 'Following' ? t('follows.tabs.following') : tab === 'Likes' ? t('follows.tabs.likes') : t('follows.tabs.comments')}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'Following' && (
          <div>
            {/* Followed Users List */}
            {data.followedUsers && data.followedUsers.length > 0 ? (
              <div className="flex gap-6 overflow-x-auto pb-6 mb-12 scrollbar-hide">
                {data.followedUsers.map(u => (
                  <Link key={u._id} to={`/author/${u._id}`} className="flex flex-col items-center min-w-[80px] group">
                    <div className="w-20 h-20 rounded-full bg-brand-red flex items-center justify-center text-2xl font-bold mb-3 overflow-hidden border-2 border-transparent group-hover:border-gray-900 dark:group-hover:border-white transition shadow-lg">
                      {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name[0]}
                    </div>
                    <span className="text-sm font-medium text-center truncate w-full group-hover:text-brand-red transition">{u.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-100 dark:bg-white/5 rounded-xl mb-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t('follows.no_following')}</p>
                <Link to="/search" className="text-brand-red hover:underline">{t('follows.discover_authors')}</Link>
              </div>
            )}
            
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-brand-red rounded-full"></span>
              {t('follows.recent_articles')}
            </h3>
            <PostGrid posts={data.following} />
          </div>
        )}

        {activeTab === 'Likes' && (
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-brand-red rounded-full"></span>
              {t('follows.liked_articles')}
            </h3>
            <PostGrid posts={data.liked} />
          </div>
        )}

        {activeTab === 'Comments' && (
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-brand-red rounded-full"></span>
              {t('follows.commented_articles')}
            </h3>
            <PostGrid posts={data.commented} />
          </div>
        )}
      </div>
    </div>
  )
}

function PostGrid({ posts }) {
  const { t } = useTranslation()
  if (!posts || posts.length === 0) return <p className="text-gray-400 italic">{t('follows.no_articles')}</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {posts.map(post => (
        <Link key={post._id} to={`/article/${post._id}`} className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition group border border-white/10 flex flex-col h-full">
          {post.imageUrl && (
            <div className="h-48 overflow-hidden relative">
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
            </div>
          )}
          <div className="p-5 flex-1 flex flex-col">
            <h4 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-brand-red transition leading-tight">{post.title}</h4>
            <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium text-gray-400">{post.author}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default Follows