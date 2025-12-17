import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, getToken } from '../lib/auth.js'

function Profile() {
  const user = getUser()
  const navigate = useNavigate()
  const [collections, setCollections] = useState([])
  async function load() {
    const token = getToken()
    if (!token) return
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/collections/me`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setCollections(data.collections || [])
  }
  useEffect(() => { load() }, [])
  async function createCollection() {
    const name = prompt('Nom de la collection:') || ''
    if (!name.trim()) return
    const isPrivate = window.confirm('Souhaitez-vous créer une collection privée ?')
    const token = getToken()
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/collections`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, isPrivate }) })
    if (res.ok) load()
  }
  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="flex items-center gap-4">
        <img src={user?.avatarUrl || '/nopfp.jpg'} alt="pfp" className="h-24 w-24 rounded-full object-cover ring-2 ring-white/40" />
        <div>
          <h1 className="text-white text-3xl font-bold">{user?.name || 'Utilisateur'}</h1>
          <div className="text-white/70">{user?.email}</div>
        </div>
      </div>
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-white text-2xl font-semibold">Collections</h2>
        <button className="btn btn-primary" onClick={createCollection}>Créer une collection</button>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map(c => (
          <div 
            key={c._id} 
            className="relative card h-40 p-0 hover:bg-gray-800 cursor-pointer transition-colors"
            onClick={() => navigate(`/collections/${c._id}`)}
          >
            <div className="px-4 pt-3">
              <div className="card-title">{c.name}</div>
            </div>
            <div className="absolute bottom-3 left-3">
              {c.isPrivate && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-700"><path d="M12 17a2 2 0 002-2v-2a2 2 0 10-4 0v2a2 2 0 002 2zm6-6h-1V9a5 5 0 10-10 0v2H6a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2zm-9 0V9a3 3 0 016 0v2H9z"/></svg>
              )}
            </div>
            <div className="absolute bottom-3 right-3">
              <div 
                onClick={(e) => { e.stopPropagation(); navigate(`/collections/${c._id}/edit`) }} 
                className="inline-flex p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white" 
                title="Modifier"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>
              </div>
            </div>
          </div>
        ))}
        {!collections.length && <div className="text-white/70">Aucune collection pour l'instant.</div>}
      </div>
    </div>
  )
}

export default Profile
