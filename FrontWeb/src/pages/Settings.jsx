import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authFetch, clearAuth, getUser } from '../lib/auth.js'
import { API_URL } from '../config.js'

function Settings() {
  const { t } = useTranslation()
  const user = getUser()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')
  const tabs = useMemo(() => ['profile', 'newsletters'], [])
  const [name, setName] = useState(user?.name || '')
  const [username, setUsername] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [bio, setBio] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const isGoogle = !!user?.isGoogle

  async function handleDeleteAccount() {
    if (!user) return
    const confirmText = isGoogle ? t('settings.delete.confirm_google') : t('settings.delete.confirm')
    if (!window.confirm(confirmText)) return
    setDeleteError('')
    setDeleteLoading(true)
    try {
      const res = await authFetch(`${API_URL}/api/auth/me`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || t('settings.delete.failed'))
      clearAuth()
      navigate('/', { replace: true })
      window.location.reload()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }
  return (
    <div className="text-gray-900 dark:text-white py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <img src={user?.avatarUrl || '/nopfp.jpg'} alt="pfp" className="h-20 w-20 rounded-full object-cover ring-2 ring-white/30" />
        <div>
          <h1 className="text-2xl font-extrabold">{user?.name || t('profile.default_user')}</h1>
        </div>
      </div>
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-white/10 pb-2 mb-6">
        {tabs.map(key => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={(tab === key ? 'text-gray-900 dark:text-white font-semibold underline underline-offset-8 decoration-2' : 'text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white') + ' text-sm'}
          >{t(`settings.tabs.${key}`)}</button>
        ))}
      </div>
      {tab === 'profile' && (
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold">{t('settings.profile.header')}</h2>
          <div>
            <label className="block text-sm mb-1">{t('settings.profile.name')}</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-white dark:bg-black/40 text-gray-900 dark:text-white border border-gray-300 dark:border-white/10 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('settings.profile.username')}</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full bg-white dark:bg-black/40 text-gray-900 dark:text-white border border-gray-300 dark:border-white/10 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('settings.profile.email')}</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-white dark:bg-black/40 text-gray-900 dark:text-white border border-gray-300 dark:border-white/10 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('settings.profile.bio')}</label>
            <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={4} className="w-full bg-white dark:bg-black/40 text-gray-900 dark:text-white border border-gray-300 dark:border-white/10 rounded px-3 py-2" />
          </div>
          <div className="flex items-center gap-2">
            <input id="private" type="checkbox" checked={isPrivate} onChange={e=>setIsPrivate(e.target.checked)} />
            <label htmlFor="private" className="text-sm">{t('settings.profile.private_account')}</label>
          </div>
          <div>
            <label className="block text-sm mb-1">{t('settings.profile.avatar')}</label>
            <input type="file" className="text-gray-600 dark:text-white/80" />
          </div>
          <button className="btn btn-primary mt-4">{t('settings.profile.save')}</button>
          <div className="pt-6 mt-2 border-t border-gray-200 dark:border-white/10">
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">{t('settings.delete.header')}</h3>
            {isGoogle && (
              <p className="mt-2 text-sm text-gray-600 dark:text-white/70">{t('settings.delete.google_connected')}</p>
            )}
            <p className="mt-2 text-sm text-gray-600 dark:text-white/70">{t('settings.delete.description')}</p>
            <button
              className="btn mt-3 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
            >
              {deleteLoading ? t('settings.delete.deleting') : t('settings.delete.button')}
            </button>
            {deleteError && <p className="mt-2 text-sm text-red-500">{deleteError}</p>}
          </div>
        </div>
      )}
      {tab === 'newsletters' && (
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold">{t('settings.newsletters.header')}</h2>
          <div className="flex flex-col gap-3 mt-2">
            <label className="inline-flex items-center gap-2"><input type="radio" name="newsletter" /> <span>{t('settings.newsletters.subscribe_all')}</span></label>
            <label className="inline-flex items-center gap-2"><input type="radio" name="newsletter" /> <span>{t('settings.newsletters.unsubscribe_all')}</span></label>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
