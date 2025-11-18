import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAuth } from '../lib/auth.js'

function Login() {
  const navigate = useNavigate()

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState('')

  async function onLogin(e) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      })
      const data = await res.json()
      if (!res.ok) { throw new Error(data?.error || 'Login failed') }
      setAuth(data.token, data.user)
      navigate('/')
    } catch (err) {
      setLoginError(err.message)
    } finally {
      setLoginLoading(false)
    }
  }

  async function onRegister(e) {
    e.preventDefault()
    setRegError('')
    setRegLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword })
      })
      const data = await res.json()
      if (!res.ok) { throw new Error(data?.error || 'Register failed') }
      setAuth(data.token, data.user)
      navigate('/')
    } catch (err) {
      setRegError(err.message)
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="max-w-md">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <form className="space-y-3" onSubmit={onLogin}>
          <input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2" />
          <input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} placeholder="Password" className="w-full border rounded px-3 py-2" />
          <button disabled={loginLoading} type="submit" className="w-full px-3 py-2 rounded bg-blue-600 text-white">{loginLoading ? 'Signing In...' : 'Sign In'}</button>
          {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
        </form>
        <div className="mt-4 text-sm text-gray-500">Login / Register available here</div>
      </div>

      <div className="max-w-md">
        <h2 className="text-xl font-semibold mb-4">Register</h2>
        <form className="space-y-3" onSubmit={onRegister}>
          <input type="text" value={regName} onChange={e=>setRegName(e.target.value)} placeholder="Name" className="w-full border rounded px-3 py-2" />
          <input type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2" />
          <input type="password" value={regPassword} onChange={e=>setRegPassword(e.target.value)} placeholder="Password" className="w-full border rounded px-3 py-2" />
          <button disabled={regLoading} type="submit" className="w-full px-3 py-2 rounded bg-green-600 text-white">{regLoading ? 'Creating...' : 'Create Account'}</button>
          {regError && <p className="text-red-600 text-sm">{regError}</p>}
        </form>
      </div>
    </div>
  )
}

export default Login