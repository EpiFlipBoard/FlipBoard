import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { getToken, authFetch, getUser } from '../lib/auth.js'
import { API_URL } from '../config.js'

export default function Comments({ postId, onClose, isPopup = false }) {
  const { t, i18n } = useTranslation()
  const [comments, setComments] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  const currentUser = getUser()

  async function fetchComments(p) {
    setLoading(true)
    try {
      const headers = {}
      const token = getToken()
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`${API_URL}/api/posts/${postId}/comments?page=${p}&limit=5`, { headers })
      const data = await res.json()
      if (res.ok) {
        setComments(data.comments)
        setTotal(data.total)
        setHasMore(data.hasMore)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments(page)
  }, [postId, page])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!newComment.trim()) return
    
    const token = getToken()
    if (!token) return alert(t('comments.login_required'))

    setSubmitting(true)
    try {
      const res = await authFetch(`${API_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newComment })
      })
      
      if (res.ok) {
        setNewComment('')
        setPage(1) // Return to first page to see new comment
        fetchComments(1)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(commentId) {
    if (!confirm(t('comments.confirm_delete'))) return

    try {
      const res = await authFetch(`${API_URL}/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setComments(comments.filter(c => c.id !== commentId))
        setTotal(t => t - 1)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const content = (
    <div className={`flex flex-col ${isPopup ? 'h-full p-6' : 'mt-8'}`}>
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('comments.title')} ({total})
        </h3>
        {isPopup && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8 flex-shrink-0">
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder={t('comments.placeholder')}
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-red focus:border-transparent bg-white dark:bg-white/10 dark:border-white/20 text-gray-900 dark:text-white resize-none"
          rows="3"
        />
        <div className="flex justify-end mt-2">
          <button 
            type="submit" 
            disabled={submitting || !newComment.trim()}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('comments.submitting') : t('comments.submit')}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto space-y-6 min-h-[200px] pr-2">
        {loading ? (
          <div className="text-center text-gray-500 py-8">{t('comments.loading')}</div>
        ) : comments.length > 0 ? (
          comments.map(c => (
            <div key={c.id} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  {c.user?.avatar ? (
                    <img src={c.user.avatar} alt={c.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-red text-white font-bold">
                      {c.user?.name?.[0] || '?'}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {c.user?.name || t('comments.unknown_user')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: i18n.language.startsWith('fr') ? fr : enUS })}
                    </span>
                    {currentUser && c.user && (currentUser.id === c.user.id || currentUser._id === c.user.id) ? (
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                        title={t('comments.delete')}
                        aria-label={t('comments.delete')}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{c.text}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">{t('comments.no_comments')}</div>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-white/10 flex-shrink-0">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {t('comments.previous')}
          </button>
          
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t('comments.page_info', { page, total: Math.ceil(total / 5) })}
          </span>
          
          <button 
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {t('comments.next')}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )

  if (isPopup) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-brand-dark w-full max-w-2xl max-h-[80vh] rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
          {content}
        </div>
      </div>
    )
  }

  return content
}
