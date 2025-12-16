// Script pour peupler la base de données avec des articles
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Post from '../src/models/Post.js'
import { fetchAndSaveArticles } from '../apis/aggregator.js'

dotenv.config()

const mongoUri = process.env.MONGODB_URI

async function main() {
  try {
    console.log('🔌 Connexion à MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connecté à MongoDB\n')

    console.log('📰 Récupération des articles via RSS...')
    
    const apiKeys = {
      newsapi: process.env.NEWSAPI_KEY,
      guardian: process.env.GUARDIAN_API_KEY,
      nytimes: process.env.NYTIMES_API_KEY
    }

    // Configuration des sources
    const sources = ['rss'] // Commence avec RSS (gratuit)
    if (apiKeys.newsapi) sources.push('newsapi')
    if (apiKeys.guardian) sources.push('guardian')
    if (apiKeys.nytimes) sources.push('nytimes')

    console.log(`📡 Sources actives: ${sources.join(', ')}`)

    const result = await fetchAndSaveArticles(Post, apiKeys, {
      sources,
      pageSize: 15
    })

    console.log('\n✨ Résultats:')
    console.log(`   - ${result.total} articles récupérés`)
    console.log(`   - ${result.saved} nouveaux articles sauvegardés`)
    console.log(`   - ${result.updated} articles mis à jour`)

    // Afficher quelques exemples
    const recentPosts = await Post.find().sort({ createdAt: -1 }).limit(5)
    console.log('\n📝 Derniers articles ajoutés:')
    recentPosts.forEach((post, i) => {
      console.log(`   ${i + 1}. ${post.title}`)
      console.log(`      Source: ${post.author} | Type: ${post.type}`)
    })

    await mongoose.disconnect()
    console.log('\n✅ Terminé !')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }
}

main()
