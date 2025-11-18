import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const data = [
  { id: '1', title: 'AI trends in 2025', source: 'TechNews', summary: 'Overview of AI progress and its impact.' },
  { id: '2', title: 'Designing magazines on web', source: 'WebDesign', summary: 'Patterns for immersive reading experiences.' },
  { id: '3', title: 'Understanding RSS today', source: 'RSS Weekly', summary: 'Best practices for feed aggregation.' },
]

function Search() {
  const [q, setQ] = useState('')
  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return data.filter(a => a.title.toLowerCase().includes(s) || a.summary.toLowerCase().includes(s))
  }, [q])

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Search</h1>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search articles"
        className="w-full max-w-md border rounded px-3 py-2"
      />
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map(a => (
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

export default Search