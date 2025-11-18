const KEY = 'epi_favorites'

export function getFavorites() {
  const raw = localStorage.getItem(KEY)
  try { return raw ? JSON.parse(raw) : [] } catch { return [] }
}

export function setFavorites(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function toggleFavorite(article) {
  const list = getFavorites()
  const idx = list.findIndex(a => a.id === article.id)
  if (idx >= 0) {
    list.splice(idx, 1)
  } else {
    list.push(article)
  }
  setFavorites(list)
  return list
}