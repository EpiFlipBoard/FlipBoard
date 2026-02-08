import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authFetch } from '../lib/auth.js'
import { API_URL } from '../config.js'

function EditCollection() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  async function load() {
    const res = await authFetch(`${API_URL}/api/collections/${id}`)
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
    const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/collections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, imageUrl, isPrivate }),
    })
    if (res.ok) navigate('/profile')
  }

  return (
    <div className="max-w-2xl mx-auto py-10 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6">{t('edit_collection.title')}</h1>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">{t('edit_collection.name')}</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-white dark:bg-black/40 text-gray-900 dark:text-white border border-gray-300 dark:border-white/10 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">{t('edit_collection.description')}</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} className="w-full bg-white dark:bg-black/40 text-gray-900 dark:text-white border border-gray-300 dark:border-white/10 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">{t('edit_collection.cover_image')}</label>
          <input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} className="w-full bg-white dark:bg-black/40 text-gray-900 dark:text-white border border-gray-300 dark:border-white/10 rounded px-3 py-2" />
        </div>
        <div className="flex items-center gap-2">
          <input id="private" type="checkbox" checked={isPrivate} onChange={e=>setIsPrivate(e.target.checked)} />
          <label htmlFor="private" className="text-sm">{t('edit_collection.private')}</label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary">{t('edit_collection.save')}</button>
          <button type="button" className="btn btn-muted" onClick={() => navigate('/profile')}>{t('edit_collection.cancel')}</button>
        </div>
      </form>
    </div>
  )
}

export default EditCollection
