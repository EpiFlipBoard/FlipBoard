// NewsAPI - https://newsapi.org
// Inscription gratuite : 100 requêtes par jour

export async function fetchNewsAPI(apiKey, options = {}) {
  const { 
    country = 'fr', 
    category = '', 
    query = '', 
    pageSize = 20 
  } = options

  const params = new URLSearchParams({
    apiKey,
    pageSize: pageSize.toString(),
  })

  if (country) params.append('country', country)
  if (category) params.append('category', category)
  if (query) params.append('q', query)

  const endpoint = query 
    ? 'https://newsapi.org/v2/everything'
    : 'https://newsapi.org/v2/top-headlines'

  try {
    const response = await fetch(`${endpoint}?${params}`)
    const data = await response.json()

    if (!response.ok) {
      console.error('NewsAPI Error:', data)
      return []
    }

    return (data.articles || []).map(article => ({
      title: article.title,
      description: article.description || '',
      url: article.url,
      imageUrl: article.urlToImage || '',
      author: article.source?.name || article.author || 'Unknown',
      publishedAt: new Date(article.publishedAt),
      type: category || 'Actualités',
      source: 'NewsAPI'
    }))
  } catch (error) {
    console.error('NewsAPI fetch error:', error)
    return []
  }
}
