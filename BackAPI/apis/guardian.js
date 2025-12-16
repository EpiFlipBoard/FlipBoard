// The Guardian API - https://open-platform.theguardian.com
// Inscription gratuite : 5000 requêtes par jour

export async function fetchGuardian(apiKey, options = {}) {
  const { 
    section = '', 
    query = '', 
    pageSize = 20 
  } = options

  const params = new URLSearchParams({
    'api-key': apiKey,
    'show-fields': 'thumbnail,trailText,byline',
    'page-size': pageSize.toString(),
  })

  if (section) params.append('section', section)
  if (query) params.append('q', query)

  try {
    const response = await fetch(`https://content.guardianapis.com/search?${params}`)
    const data = await response.json()

    if (data.response?.status !== 'ok') {
      console.error('Guardian API Error:', data)
      return []
    }

    return (data.response.results || []).map(article => ({
      title: article.webTitle,
      description: article.fields?.trailText || '',
      url: article.webUrl,
      imageUrl: article.fields?.thumbnail || '',
      author: article.fields?.byline || 'The Guardian',
      publishedAt: new Date(article.webPublicationDate),
      type: article.sectionName || 'Actualités',
      source: 'The Guardian'
    }))
  } catch (error) {
    console.error('Guardian API fetch error:', error)
    return []
  }
}
