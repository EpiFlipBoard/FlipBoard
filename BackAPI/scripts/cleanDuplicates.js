// Script pour nettoyer les articles en double dans la base de données
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Post from '../src/models/Post.js'

dotenv.config()

const mongoUri = process.env.MONGODB_URI

async function cleanDuplicates() {
  try {
    console.log('🔌 Connexion à MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connecté à MongoDB\n')

    console.log('🔍 Recherche des doublons...')
    
    // Trouver tous les articles groupés par URL
    const duplicates = await Post.aggregate([
      {
        $group: {
          _id: '$url',
          count: { $sum: 1 },
          ids: { $push: '$_id' },
          titles: { $push: '$title' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ])

    console.log(`📊 ${duplicates.length} URLs en double détectées\n`)

    let totalDeleted = 0

    for (const dup of duplicates) {
      const { _id: url, count, ids, titles } = dup
      
      console.log(`\n🔗 URL: ${url}`)
      console.log(`   Nombre de doublons: ${count}`)
      console.log(`   Titres: ${titles[0]}`)
      
      // Garder le premier (le plus ancien), supprimer les autres
      const toDelete = ids.slice(1)
      
      const result = await Post.deleteMany({ _id: { $in: toDelete } })
      totalDeleted += result.deletedCount
      
      console.log(`   ❌ ${result.deletedCount} doublons supprimés`)
    }

    console.log(`\n✅ Nettoyage terminé: ${totalDeleted} articles supprimés`)
    
    // Statistiques finales
    const totalArticles = await Post.countDocuments()
    console.log(`📈 Articles restants: ${totalArticles}`)

    await mongoose.disconnect()
    console.log('\n✅ Déconnecté de MongoDB')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }
}

cleanDuplicates()
