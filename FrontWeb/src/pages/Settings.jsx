import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getUser } from '../lib/auth.js'

function Settings() {
  const { t } = useTranslation()
  const user = getUser()
  const [tab, setTab] = useState('profile')
  const tabs = useMemo(() => ['profile', 'newsletters', 'content'], [])
  const [name, setName] = useState(user?.name || '')
  const [username, setUsername] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [bio, setBio] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
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
      {tab === 'content' && (
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold">{t('settings.content.header')}</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="font-semibold">{t('settings.content.muted_sources')}</div>
              <div className="text-gray-600 dark:text-white/80 mt-1">{t('settings.content.no_muted')}</div>
            </div>
            <div>
              <div className="font-semibold">{t('settings.content.blocked_profiles')}</div>
              <div className="text-gray-600 dark:text-white/80 mt-1">{t('settings.content.no_blocked')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
