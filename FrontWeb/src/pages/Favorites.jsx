import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFavorites } from '../lib/storage.js'

function Favorites() {
  const [list, setList] = useState([])
  useEffect(() => { setList(getFavorites()) }, [])
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Favorites</h1>
      {list.length === 0 && <p className="text-gray-600">No saved articles</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(a => (
          <article key={a.id} className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold">{a.title}</h2>
            <p className="text-xs text-gray-500">{a.source}</p>
            <p className="mt-2 text-sm text-gray-700">{a.summary}</p>
            <Link to={`/article/${a.id}`} className="mt-3 inline-block px-3 py-1 rounded bg-blue-600 text-white text-sm">Read</Link>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Favorites