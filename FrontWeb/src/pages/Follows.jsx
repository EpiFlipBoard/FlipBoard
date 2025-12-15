import { useState } from 'react'

function Follows() {
  const tabs = ['Tout','Sujets','Comptes','Magazines','Vidéos']
  const [tab, setTab] = useState('Tout')
  return (
    <div className="text-white py-16">
      <h1 className="text-4xl font-extrabold text-center">ABONNEMENT</h1>
      <div className="flex items-center justify-center gap-6 mt-6">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={(tab === t ? 'text-brand-blue underline underline-offset-8 decoration-2' : 'text-white/80 hover:text-white') + ' text-lg'}
          >{t}</button>
        ))}
      </div>
      <div className="mt-24 text-center text-white/90">Chargement...</div>
    </div>
  )
}

export default Follows
