import { useState } from 'react'

function Newsletter() {
  const [email, setEmail] = useState('')
  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-4">Newsletter</h1>
      <p className="text-gray-700 mb-4">Inscrivez-vous pour recevoir les meilleurs articles.</p>
      <div className="flex gap-2">
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Votre email"
          className="w-full border rounded px-3 py-2"
        />
        <button className="btn btn-primary">S’inscrire</button>
      </div>
    </div>
  )
}

export default Newsletter
