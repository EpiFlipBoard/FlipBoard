import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken, clearAuth } from '../lib/auth.js'

function CreateArticle() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const token = getToken()
    if (!token) {
      alert('Vous devez être connecté pour publier un article')
      navigate('/')
      return
    }

    const res = await fetch('http://localhost:4000/api/posts/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, description, content, imageUrl }),
    })

    if (res.status === 401) {
      clearAuth()
      alert('Session expirée. Veuillez vous reconnecter.')
      window.location.href = '/' // Force reload to update UI state
      return
    }

    if (res.ok) {
      const data = await res.json()
      navigate(`/article/${data.post._id}`)
    } else {
      alert('Failed to create article')
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Créer un article</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-white">Titre</label>
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full border p-3 rounded focus:ring-2 focus:ring-brand-red outline-none" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-white">Description courte</label>
          <input 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            className="w-full border p-3 rounded focus:ring-2 focus:ring-brand-red outline-none" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-white">URL de l'image de couverture</label>
          <input 
            value={imageUrl} 
            onChange={e => setImageUrl(e.target.value)} 
            className="w-full border p-3 rounded focus:ring-2 focus:ring-brand-red outline-none" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-white">Contenu</label>
          <textarea 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            rows={10} 
            className="w-full border p-3 rounded focus:ring-2 focus:ring-brand-red outline-none" 
            required 
          />
        </div>
        <div className="flex gap-4">
          <button type="submit" className="btn btn-primary px-8 py-3 text-lg">Publier</button>
          <button type="button" onClick={() => navigate('/')} className="btn btn-muted px-8 py-3 text-lg">Annuler</button>
        </div>
      </form>
    </div>
  )
}

export default CreateArticle
