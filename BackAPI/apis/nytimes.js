// New York Times API - https://developer.nytimes.com
// Inscription gratuite : 500 requêtes par jour, 5 requêtes par minute

export async function fetchNYTimes(apiKey, options = {}) {
  const { 
    section = 'home', 
    pageSize = 20 
  } = options

  try {
    const response = await fetch(
      `https://api.nytimes.com/svc/topstories/v2/${section}.json?api-key=${apiKey}`
    )
    const data = await response.json()

    if (!response.ok) {
      console.error('NYTimes API Error:', data)
      return []
    }

    return (data.results || []).slice(0, pageSize).map(article => ({
      title: article.title,
      description: article.abstract || '',
      url: article.url,
      imageUrl: article.multimedia?.[0]?.url || '',
      author: article.byline || 'The New York Times',
      publishedAt: new Date(article.published_date),
      type: article.section || 'Actualités',
      source: 'NY Times'
    }))
  } catch (error) {
    console.error('NYTimes API fetch error:', error)
    return []
  }
}
