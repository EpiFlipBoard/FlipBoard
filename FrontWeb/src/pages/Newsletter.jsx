import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { API_URL } from '../config.js'

function Newsletter() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)

  async function handleSubscribe() {
    if (!email) return
    setLoading(true)
    setMessage('')
    setError(false)
    
    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessage(t('footer.subscribe_success'))
        setEmail('')
      } else {
        setError(true)
        setMessage(data.error || t('footer.error_occurred'))
      }
    } catch (e) {
      setError(true)
      setMessage(t('footer.error_occurred'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('newsletter.title')}</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-4">{t('newsletter.description')}</p>
      <div className="flex gap-2">
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('newsletter.email_placeholder')}
          className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-red"
          disabled={loading}
          onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
        />
        <button 
          onClick={handleSubscribe} 
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? t('common.loading') : t('newsletter.subscribe')}
        </button>
      </div>
      {message && (
        <p className={`mt-2 text-sm ${error ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
    </div>
  )
}

export default Newsletter
