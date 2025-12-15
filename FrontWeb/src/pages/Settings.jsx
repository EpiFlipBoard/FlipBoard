import { useMemo, useState } from 'react'
import { getUser } from '../lib/auth.js'

function Settings() {
  const user = getUser()
  const [tab, setTab] = useState('Profil')
  const tabs = useMemo(() => ['Paramètres du profil','Abonnements aux Newsletters','Options de contenu'], [])
  const [name, setName] = useState(user?.name || '')
  const [username, setUsername] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [bio, setBio] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  return (
    <div className="text-white py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <img src={user?.avatarUrl || '/nopfp.jpg'} alt="pfp" className="h-20 w-20 rounded-full object-cover ring-2 ring-white/30" />
        <div>
          <h1 className="text-2xl font-extrabold">{user?.name || 'Utilisateur'}</h1>
        </div>
      </div>
      <div className="flex items-center gap-4 border-b border-white/10 pb-2 mb-6">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={(tab === t ? 'text-white font-semibold underline underline-offset-8 decoration-2' : 'text-white/80 hover:text-white') + ' text-sm'}
          >{t}</button>
        ))}
      </div>
      {tab === 'Paramètres du profil' && (
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold">PARAMÈTRES DU COMPTE</h2>
          <div>
            <label className="block text-sm mb-1">Nom</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-black/40 text-white border border-white/10 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Nom d'utilisateur</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full bg-black/40 text-white border border-white/10 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-black/40 text-white border border-white/10 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Bio</label>
            <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={4} className="w-full bg-black/40 text-white border border-white/10 rounded px-3 py-2" />
          </div>
          <div className="flex items-center gap-2">
            <input id="private" type="checkbox" checked={isPrivate} onChange={e=>setIsPrivate(e.target.checked)} />
            <label htmlFor="private" className="text-sm">Compte privé</label>
          </div>
          <div>
            <label className="block text-sm mb-1">Avatar</label>
            <input type="file" className="text-white/80" />
          </div>
          <h3 className="text-lg font-extrabold mt-6">PARAMÈTRES DU COMPTE</h3>
          <div className="space-y-2 text-white/80">
            <div>Vos choix pour les données personnelles</div>
            <div>Changer le mot de passe</div>
            <div>Supprimer le compte</div>
          </div>
          <button className="btn btn-primary mt-4">Enregistrer</button>
        </div>
      )}
      {tab === 'Abonnements aux Newsletters' && (
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold">ABONNEMENTS AUX NEWSLETTERS</h2>
          <div className="flex flex-col gap-3 mt-2">
            <label className="inline-flex items-center gap-2"><input type="radio" name="newsletter" /> <span>Abonnez-vous à tout</span></label>
            <label className="inline-flex items-center gap-2"><input type="radio" name="newsletter" /> <span>Se désabonner de tout</span></label>
          </div>
        </div>
      )}
      {tab === 'Options de contenu' && (
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold">OPTIONS DE CONTENU</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="font-semibold">Sources et domaines en sourdine</div>
              <div className="text-white/80 mt-1">Vous n'avez mis aucune source en sourdine</div>
            </div>
            <div>
              <div className="font-semibold">Profils bloqués</div>
              <div className="text-white/80 mt-1">Vous n'avez bloqué personne</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
