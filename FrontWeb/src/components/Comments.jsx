import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { getToken, authFetch } from '../lib/auth.js'
import { Link } from 'react-router-dom'

export default function Comments({ postId, onClose, isPopup = false }) {
  const [comments, setComments] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function fetchComments(p) {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/api/posts/${postId}/comments?page=${p}&limit=5`)
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
    if (!token) return alert('Veuillez vous connecter pour commenter.')

    setSubmitting(true)
    try {
      const res = await authFetch(`http://localhost:4000/api/posts/${postId}/comments`, {
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

  const content = (
    <div className={`flex flex-col ${isPopup ? 'h-full p-6' : 'mt-8'}`}>
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Commentaires ({total})
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
          placeholder="Ajouter un commentaire..."
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-red focus:border-transparent dark:bg-white/10 dark:border-white/20 dark:text-white resize-none"
          rows="3"
        />
        <div className="flex justify-end mt-2">
          <button 
            type="submit" 
            disabled={submitting || !newComment.trim()}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Envoi...' : 'Commenter'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto space-y-6 min-h-[200px] pr-2">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Chargement...</div>
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
                    {c.user?.name || 'Utilisateur inconnu'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{c.text}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">Aucun commentaire pour le moment.</div>
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
            Précédent
          </button>
          
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Page {page} sur {Math.ceil(total / 5)}
          </span>
          
          <button 
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Suivant
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
