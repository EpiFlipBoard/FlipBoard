function Help() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 text-white">
      <h1 className="text-4xl font-bold mb-8">Centre d'aide</h1>
      <div className="mb-12">
        <input 
          type="text" 
          placeholder="Comment pouvons-nous vous aider ?" 
          className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-brand-red placeholder-white/50"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <HelpCategory title="Premiers pas" items={['Créer un compte', 'Configurer votre profil', 'Suivre des sujets']} />
        <HelpCategory title="Votre compte" items={['Gérer les paramètres', 'Sécurité', 'Notifications']} />
        <HelpCategory title="Magazines" items={['Créer un magazine', 'Ajouter des articles', 'Partager']} />
      </div>
    </div>
  )
}

function HelpCategory({ title, items }) {
  return (
    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
      <h3 className="text-xl font-bold mb-4 text-brand-red">{title}</h3>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i}>
            <a href="#" className="text-white/80 hover:text-white hover:underline decoration-brand-red underline-offset-4">{item}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Help