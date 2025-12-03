import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toggleFavorite, getFavorites } from '../lib/storage.js'

const sample = [
  { id: '1', title: 'AI trends in 2025', source: 'TechNews', summary: 'Overview of AI progress and its impact.', category: 'Tech et sciences' },
  { id: '2', title: 'Designing magazines on web', source: 'WebDesign', summary: 'Patterns for immersive reading experiences.', category: 'Inédit' },
  { id: '3', title: 'Understanding RSS today', source: 'RSS Weekly', summary: 'Best practices for feed aggregation.', category: 'Actualités' },
  { id: '4', title: 'Local startup raises funds', source: 'LocalNews', summary: 'Promising venture in the city.', category: 'Local' },
  { id: '5', title: 'Markets rally on earnings', source: 'FinanceDaily', summary: 'Investors react to quarterly reports.', category: 'Économie' },
  { id: '6', title: 'Championship highlights', source: 'SportsWorld', summary: 'Key moments from last night.', category: 'Sport' },
]

function Home() {
  const [favorites, setFavorites] = useState(getFavorites())
  const favIds = useMemo(() => new Set(favorites.map(a => a.id)), [favorites])
  const categories = ['Explore Spotlight','Inédit','Actualités','Local','Économie','Tech et sciences','Sport']
  const [selected, setSelected] = useState('Explore Spotlight')

  const items = useMemo(() => {
    if (selected === 'Explore Spotlight') return sample
    return sample.filter(a => a.category === selected)
  }, [selected])

  return (
    <div>
      <section className="text-center pt-28 bg-brand-dark text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-6xl font-extrabold leading-tight">RESTEZ INFORMÉS<br/>TROUVEZ DE L'INSPIRATION</h1>
          <div className="h-3 bg-brand-blue w-full mx-auto my-4" />
          <p className="text-white/80 text-2xl">Histoires sélectionnées pour vous</p>
          <Link to="/login" className="mt-12 mb-20 inline-flex btn btn-primary text-xl px-8 py-4">Créer un compte</Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-20 py-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              className={(selected === cat ? 'text-brand-blue font-semibold' : 'text-gray-300 hover:text-white') + ' text-lg'}
            >{cat}</button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(a => (
            <article key={a.id} className="card">
              <div className="h-28 bg-gradient-to-br from-brand-blue to-blue-600" />
              <div className="p-4 flex flex-col">
                <h2 className="card-title">{a.title}</h2>
                <p className="text-xs text-gray-500">{a.source} • {a.category}</p>
                <p className="mt-2 text-sm text-gray-700">{a.summary}</p>
                <div className="mt-4 flex gap-2">
                  <Link to={`/article/${a.id}`} className="btn btn-primary">Lire</Link>
                  <button
                    className={"btn " + (favIds.has(a.id) ? 'bg-yellow-500 text-white' : 'btn-muted')}
                    onClick={() => setFavorites(toggleFavorite(a))}
                  >{favIds.has(a.id) ? 'Enregistré' : 'Enregistrer'}</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
