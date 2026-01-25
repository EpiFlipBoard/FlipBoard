import { Link } from 'react-router-dom'
import { API_URL } from '../config.js'

function Footer() {
  async function handleSubscribe(e) {
    e.preventDefault()
    const email = e.target.email.value
    if (!email) return
    
    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      alert(data.message || 'Merci de votre inscription !')
      e.target.reset()
    } catch (err) {
      alert('Une erreur est survenue.')
    }
  }

  return (
    <footer className="bg-brand-dark text-white pt-16 pb-8 border-t border-white/10 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded" />
              <span className="text-xl font-bold">EPI-FLIPBOARD</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Votre source quotidienne d'inspiration et d'information. Découvrez des histoires qui comptent pour vous.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4">
              <label className="block text-xs font-bold uppercase mb-2 text-gray-500">S'abonner à la newsletter</label>
              <div className="flex">
                <input type="email" name="email" placeholder="Votre email" className="bg-white/10 border-none rounded-l px-4 py-2 text-sm w-full focus:ring-1 focus:ring-brand-red" required />
                <button type="submit" className="bg-brand-red px-4 py-2 rounded-r text-sm font-bold hover:bg-red-700 transition">OK</button>
              </div>
            </form>
          </div>

          {/* Column 2: Links */}
          <div>
            <h3 className="font-bold mb-4 text-lg">Découvrir</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-brand-red transition">Accueil</Link></li>
              <li><Link to="/newsletter" className="hover:text-brand-red transition">Newsletter</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="font-bold mb-4 text-lg">Entreprise</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/about" className="hover:text-brand-red transition">À propos</Link></li>
              <li><Link to="/create" className="hover:text-brand-red transition">Créer un article</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="font-bold mb-4 text-lg">Aide</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/help" className="hover:text-brand-red transition">Centre d'aide</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-red transition">Confidentialité</Link></li>
              <li><Link to="/terms" className="hover:text-brand-red transition">Conditions d'utilisation</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Epi-Flipboard. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <Link to="/explore" className="hover:text-white transition">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialIcon({ href, path }) {
  return (
    <a href={href} className="bg-white/10 p-2 rounded-full hover:bg-brand-red hover:text-white transition text-white">
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d={path} />
      </svg>
    </a>
  )
}

export default Footer