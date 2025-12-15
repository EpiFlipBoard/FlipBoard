import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getToken } from '../lib/auth.js'

function EditCollection() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  async function load() {
    const token = getToken()
    const res = await fetch(`http://localhost:4000/api/collections/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (res.ok && data.collection) {
      setName(data.collection.name || '')
      setDescription(data.collection.description || '')
      setImageUrl(data.collection.imageUrl || '')
      setIsPrivate(!!data.collection.isPrivate)
    }
  }
  useEffect(() => { load() }, [id])

  async function save(e) {
    e.preventDefault()
    const token = getToken()
    const res = await fetch(`http://localhost:4000/api/collections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, description, imageUrl, isPrivate }),
    })
    if (res.ok) navigate('/profile')
  }

  return (
    <div className="max-w-2xl mx-auto py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Modifier la collection</h1>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nom</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-black/40 text-white border border-white/10 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} className="w-full bg-black/40 text-white border border-white/10 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Image de couverture (URL)</label>
          <input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} className="w-full bg-black/40 text-white border border-white/10 rounded px-3 py-2" />
        </div>
        <div className="flex items-center gap-2">
          <input id="private" type="checkbox" checked={isPrivate} onChange={e=>setIsPrivate(e.target.checked)} />
          <label htmlFor="private" className="text-sm">Privée</label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary">Enregistrer</button>
          <button type="button" className="btn btn-muted" onClick={() => navigate('/profile')}>Annuler</button>
        </div>
      </form>
    </div>
  )
}

export default EditCollection
