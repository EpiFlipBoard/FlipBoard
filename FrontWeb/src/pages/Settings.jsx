import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authFetch, clearAuth, getUser, setAuth, getToken } from '../lib/auth.js'
import { API_URL } from '../config.js'

function Settings() {
  const { t } = useTranslation()
  const user = getUser()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')
  const tabs = useMemo(() => ['profile', 'newsletters'], [])
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const isGoogle = !!user?.isGoogle

  async function handleSave(e) {
    e.preventDefault()
    setSaveError('')
    setSaveSuccess(false)
    setSaveLoading(true)
    try {
      let avatarUrl = user?.avatarUrl || ''
      if (avatarFile) {
        // Simulate upload (replace with real upload logic)
        avatarUrl = URL.createObjectURL(avatarFile)
      }
      const res = await authFetch(`${API_URL}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          bio,
          isPrivate,
          avatar: avatarUrl
        })
      })
      if (!res.ok) throw new Error('Failed to save')
      // Update localStorage with new user data
      const data = await res.json()
      if (data.user) {
        setAuth(getToken(), data.user)
      }
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaveLoading(false)
    }
  }

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
        <form className="space-y-6 bg-white/80 dark:bg-black/40 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-white/10" style={{maxWidth: 520, margin: '0 auto'}} onSubmit={handleSave}>
          <h2 className="text-2xl font-bold mb-2 text-brand-red tracking-tight">{t('settings.profile.header')}</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-white/80">{t('settings.profile.name')}</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/60 px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-white/80">{t('settings.profile.email')}</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/60 px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-white/80">{t('settings.profile.bio')}</label>
              <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/60 px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red focus:outline-none transition" />
            </div>
            <div className="flex items-center gap-2">
              <input id="private" type="checkbox" checked={isPrivate} onChange={e=>setIsPrivate(e.target.checked)} className="rounded border-gray-300 dark:border-white/20 focus:ring-brand-red" />
              <label htmlFor="private" className="text-sm text-gray-700 dark:text-white/80">{t('settings.profile.private_account')}</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-white/80">{t('settings.profile.avatar')}</label>
              <input type="file" accept="image/*" onChange={e=>setAvatarFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-red/10 file:text-brand-red hover:file:bg-brand-red/20" />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <button type="submit" className="btn btn-primary px-6 py-2 rounded-lg text-lg font-semibold shadow transition bg-brand-red hover:bg-brand-red/90 text-white disabled:opacity-60" disabled={saveLoading}>{saveLoading ? t('common.loading') : t('settings.profile.save')}</button>
            {saveSuccess && <span className="text-green-600 dark:text-green-400 text-sm">{t('common.success')}</span>}
            {saveError && <span className="text-red-500 text-sm">{saveError}</span>}
          </div>
          <div className="pt-8 mt-4 border-t border-gray-200 dark:border-white/10">
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-2">{t('settings.delete.header')}</h3>
            {isGoogle && (
              <p className="mt-2 text-sm text-gray-600 dark:text-white/70">{t('settings.delete.google_connected')}</p>
            )}
            <p className="mt-2 text-sm text-gray-600 dark:text-white/70">{t('settings.delete.description')}</p>
            <button
              type="button"
              className="btn mt-3 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold shadow"
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
            >
              {deleteLoading ? t('settings.delete.deleting') : t('settings.delete.button')}
            </button>
            {deleteError && <p className="mt-2 text-sm text-red-500">{deleteError}</p>}
          </div>
        </form>
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
