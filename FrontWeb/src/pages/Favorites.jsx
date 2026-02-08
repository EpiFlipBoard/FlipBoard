import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getFavorites } from '../lib/storage.js'

function Favorites() {
  const { t } = useTranslation()
  const [list, setList] = useState([])
  useEffect(() => { setList(getFavorites()) }, [])
  return (
    <div className="text-gray-900 dark:text-white">
      <h1 className="text-xl font-semibold mb-4">{t('favorites.title')}</h1>
      {list.length === 0 && <p className="text-gray-600 dark:text-gray-400">{t('favorites.empty')}</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map(a => (
          <article key={a.id} className="card">
            <div className="h-24 bg-gradient-to-br from-brand-red to-pink-600" />
            <div className="p-4">
              <h2 className="card-title">{a.title}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{a.source}</p>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{a.summary}</p>
              <Link to={`/article/${a.id}`} className="mt-3 inline-block btn btn-primary">{t('favorites.read')}</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Favorites