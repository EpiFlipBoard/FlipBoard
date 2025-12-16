// Parser RSS pour sources d'actualités francophones
// Pas besoin d'API key, sources gratuites

const RSS_FEEDS = {
  'Le Monde': 'https://www.lemonde.fr/rss/une.xml',
  'Le Figaro': 'https://www.lefigaro.fr/rss/figaro_actualites.xml',
  'France Info': 'https://www.francetvinfo.fr/titres.rss',
  'RFI': 'https://www.rfi.fr/fr/rss',
  'L\'Express': 'https://www.lexpress.fr/arc/outboundfeeds/rss/alaune.xml',
}

async function parseRSSFeed(feedUrl, sourceName) {
  try {
    const response = await fetch(feedUrl)
    const xmlText = await response.text()
    
    // Parse simple XML (RSS 2.0)
    const items = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
    
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemXml = match[1]
      
      const getTag = (tag) => {
        const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([^\\]]+)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]+)<\\/${tag}>`, 'i')
        const m = regex.exec(itemXml)
        return m ? (m[1] || m[2] || '').trim() : ''
      }
      
      const getMediaUrl = () => {
        const mediaRegex = /<media:content[^>]*url="([^"]+)"/i
        const enclosureRegex = /<enclosure[^>]*url="([^"]+)"/i
        const mediaMatch = mediaRegex.exec(itemXml) || enclosureRegex.exec(itemXml)
        return mediaMatch ? mediaMatch[1] : ''
      }
      
      items.push({
        title: getTag('title'),
        description: getTag('description'),
        url: getTag('link'),
        imageUrl: getMediaUrl(),
        author: sourceName,
        publishedAt: new Date(getTag('pubDate') || Date.now()),
        type: 'Actualités',
        source: sourceName
      })
    }
    
    return items
  } catch (error) {
    console.error(`RSS fetch error for ${sourceName}:`, error)
    return []
  }
}

export async function fetchRSSFeeds(options = {}) {
  const { sources = Object.keys(RSS_FEEDS), pageSize = 10 } = options
  
  const allArticles = []
  
  for (const source of sources) {
    const feedUrl = RSS_FEEDS[source]
    if (feedUrl) {
      const articles = await parseRSSFeed(feedUrl, source)
      allArticles.push(...articles.slice(0, pageSize))
    }
  }
  
  // Trier par date de publication
  return allArticles.sort((a, b) => b.publishedAt - a.publishedAt)
}
