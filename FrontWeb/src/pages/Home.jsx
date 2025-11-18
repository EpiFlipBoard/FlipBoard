import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toggleFavorite, getFavorites } from '../lib/storage.js'

const sample = [
  { id: '1', title: 'AI trends in 2025', source: 'TechNews', summary: 'Overview of AI progress and its impact.' },
  { id: '2', title: 'Designing magazines on web', source: 'WebDesign', summary: 'Patterns for immersive reading experiences.' },
  { id: '3', title: 'Understanding RSS today', source: 'RSS Weekly', summary: 'Best practices for feed aggregation.' },
]

function Home() {
  const [favorites, setFavorites] = useState(getFavorites())
  const favIds = useMemo(() => new Set(favorites.map(a => a.id)), [favorites])

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sample.map(a => (
        <article key={a.id} className="bg-white shadow rounded-lg p-4 flex flex-col">
          <h2 className="text-lg font-semibold">{a.title}</h2>
          <p className="text-xs text-gray-500">{a.source}</p>
          <p className="mt-2 text-sm text-gray-700">{a.summary}</p>
          <div className="mt-4 flex gap-2">
            <Link to={`/article/${a.id}`} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Read</Link>
            <button
              className={"px-3 py-1 rounded text-sm " + (favIds.has(a.id) ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-800')}
              onClick={() => setFavorites(toggleFavorite(a))}
            >{favIds.has(a.id) ? 'Saved' : 'Save'}</button>
          </div>
        </article>
      ))}
    </div>
  )
}

export default Home