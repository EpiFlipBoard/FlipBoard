import { useState } from 'react'
import { useTranslation } from 'react-i18next'

function Newsletter() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
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
        />
        <button className="btn btn-primary">{t('newsletter.subscribe')}</button>
      </div>
    </div>
  )
}

export default Newsletter
