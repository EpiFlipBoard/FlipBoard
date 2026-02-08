const TOKEN_KEY = 'epi_token'
const USER_KEY = 'epi_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY)
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}

export function setAuth(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getUserInitial(user) {
  const name = user?.name || ''
  const src = name || user?.email || ''
  return src ? src.trim().charAt(0).toUpperCase() : ''
}

/**
 * Wrapper pour fetch qui gère automatiquement l'expiration du token
 * Si le serveur retourne 401, déconnecte l'utilisateur et recharge la page
 */
export async function authFetch(url, options = {}) {
  const token = getToken()
  
  // Ajouter automatiquement le header Authorization si un token existe
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
  
  const response = await fetch(url, { ...options, headers })
  
  // Si 401 (non autorisé), c'est probablement que le token a expiré
  if (response.status === 401) {
    clearAuth()
    alert('Votre session a expiré. Veuillez vous reconnecter.')
    window.location.href = '/'
    throw new Error('Session expired')
  }
  
  return response
}