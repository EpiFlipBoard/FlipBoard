import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) { throw new Error(data?.error || 'Login failed') }
      localStorage.setItem('epi_token', data.token)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full border rounded px-3 py-2" />
        <button disabled={loading} type="submit" className="w-full px-3 py-2 rounded bg-blue-600 text-white">{loading ? 'Signing In...' : 'Sign In'}</button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
      <div className="mt-4 flex gap-2">
        <button className="px-3 py-2 rounded bg-red-500 text-white">Google</button>
        <button className="px-3 py-2 rounded bg-blue-700 text-white">Facebook</button>
      </div>
    </div>
  )
}

export default Login