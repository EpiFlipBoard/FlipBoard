// Agrégateur d'articles de toutes les sources API
import { fetchNewsAPI } from './newsapi.js'
import { fetchGuardian } from './guardian.js'
import { fetchNYTimes } from './nytimes.js'
import { fetchRSSFeeds } from './rss.js'

/**
 * Récupère des articles de toutes les sources configurées
 * @param {Object} apiKeys - Clés API pour chaque service
 * @param {string} apiKeys.newsapi - Clé NewsAPI
 * @param {string} apiKeys.guardian - Clé Guardian
 * @param {string} apiKeys.nytimes - Clé NY Times
 * @param {Object} options - Options de récupération
 * @param {Array<string>} options.sources - Sources à utiliser (newsapi, guardian, nytimes, rss)
 * @param {number} options.pageSize - Nombre d'articles par source
 * @param {string} options.category - Catégorie d'articles
 * @param {string} options.query - Recherche par mot-clé
 */
export async function aggregateArticles(apiKeys = {}, options = {}) {
  const {
    sources = ['rss'], // Par défaut, utilise seulement RSS (gratuit)
    pageSize = 10,
    category = '',
    query = ''
  } = options

  const allArticles = []
  const promises = []

  // NewsAPI
  if (sources.includes('newsapi') && apiKeys.newsapi) {
    promises.push(
      fetchNewsAPI(apiKeys.newsapi, { category, query, pageSize })
        .then(articles => allArticles.push(...articles))
        .catch(err => console.error('NewsAPI error:', err))
    )
  }

  // Guardian
  if (sources.includes('guardian') && apiKeys.guardian) {
    promises.push(
      fetchGuardian(apiKeys.guardian, { section: category, query, pageSize })
        .then(articles => allArticles.push(...articles))
        .catch(err => console.error('Guardian error:', err))
    )
  }

  // NY Times
  if (sources.includes('nytimes') && apiKeys.nytimes) {
    promises.push(
      fetchNYTimes(apiKeys.nytimes, { section: category, pageSize })
        .then(articles => allArticles.push(...articles))
        .catch(err => console.error('NYTimes error:', err))
    )
  }

  // RSS Feeds (gratuit, pas besoin d'API key)
  if (sources.includes('rss')) {
    promises.push(
      fetchRSSFeeds({ pageSize })
        .then(articles => allArticles.push(...articles))
        .catch(err => console.error('RSS error:', err))
    )
  }

  await Promise.all(promises)

  // Dédupliquer par titre (similaire)
  const uniqueArticles = []
  const seenTitles = new Set()

  for (const article of allArticles) {
    const normalizedTitle = article.title?.toLowerCase().trim()
    if (normalizedTitle && !seenTitles.has(normalizedTitle)) {
      seenTitles.add(normalizedTitle)
      uniqueArticles.push(article)
    }
  }

  // Trier par date de publication
  return uniqueArticles
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .slice(0, pageSize * sources.length)
}

/**
 * Sauvegarde les articles récupérés dans la base de données
 */
export async function fetchAndSaveArticles(Post, apiKeys = {}, options = {}) {
  try {
    const articles = await aggregateArticles(apiKeys, options)
    
    let savedCount = 0
    let updatedCount = 0

    for (const article of articles) {
      // Vérifier si l'article existe déjà (par URL)
      const existing = await Post.findOne({ url: article.url })
      
      if (existing) {
        // Mettre à jour si nécessaire
        existing.title = article.title
        existing.description = article.description
        existing.imageUrl = article.imageUrl
        await existing.save()
        updatedCount++
      } else {
        // Créer un nouveau post
        await Post.create({
          title: article.title,
          description: article.description,
          url: article.url,
          imageUrl: article.imageUrl,
          author: article.author,
          type: article.type,
          likes: 0,
          createdAt: article.publishedAt
        })
        savedCount++
      }
    }

    return {
      total: articles.length,
      saved: savedCount,
      updated: updatedCount
    }
  } catch (error) {
    console.error('Error fetching and saving articles:', error)
    throw error
  }
}
