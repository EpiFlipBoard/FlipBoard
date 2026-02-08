// Script pour corriger les entités HTML dans les articles
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Post from '../src/models/Post.js'

dotenv.config()

const mongoUri = process.env.MONGODB_URI

/**
 * Décode les entités HTML (&#xE9; -> é, &nbsp; -> espace, etc.)
 */
function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') return text
  
  let decoded = text
  
  // Décoder les entités HTML communes
  const entities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&eacute;': 'é',
    '&egrave;': 'è',
    '&ecirc;': 'ê',
    '&agrave;': 'à',
    '&acirc;': 'â',
    '&ugrave;': 'ù',
    '&ucirc;': 'û',
    '&ccedil;': 'ç',
    '&ocirc;': 'ô',
    '&icirc;': 'î',
    '&euml;': 'ë',
    '&iuml;': 'ï',
    '&uuml;': 'ü',
    '&auml;': 'ä',
    '&ouml;': 'ö'
  }
  
  // Remplacer les entités nommées
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char)
  }
  
  // Décoder les entités numériques hexadécimales (&#xE9; -> é)
  decoded = decoded.replace(/&#x([0-9A-F]+);/gi, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16))
  })
  
  // Décoder les entités numériques décimales (&#233; -> é)
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10))
  })
  
  return decoded
}

async function fixAllArticles() {
  try {
    console.log('🔌 Connexion à MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connecté à MongoDB\n')

    console.log('🔍 Recherche des articles avec entités HTML...')
    
    // Trouver tous les articles
    const posts = await Post.find({})
    console.log(`📊 ${posts.length} articles trouvés\n`)

    let fixedCount = 0
    const problematicPattern = /&#x[0-9A-F]+;|&#\d+;|&[a-z]+;/i

    for (const post of posts) {
      let needsUpdate = false
      
      // Vérifier si l'article contient des entités HTML
      const hasEntitiesInTitle = post.title && problematicPattern.test(post.title)
      const hasEntitiesInDesc = post.description && problematicPattern.test(post.description)
      const hasEntitiesInAuthor = post.author && problematicPattern.test(post.author)
      
      if (hasEntitiesInTitle || hasEntitiesInDesc || hasEntitiesInAuthor) {
        const oldTitle = post.title
        
        // Décoder les entités HTML
        if (hasEntitiesInTitle) {
          post.title = decodeHtmlEntities(post.title)
          needsUpdate = true
        }
        
        if (hasEntitiesInDesc) {
          post.description = decodeHtmlEntities(post.description)
          needsUpdate = true
        }
        
        if (hasEntitiesInAuthor) {
          post.author = decodeHtmlEntities(post.author)
          needsUpdate = true
        }
        
        if (needsUpdate) {
          await post.save()
          fixedCount++
          console.log(`✅ Corrigé: "${oldTitle}" -> "${post.title}"`)
        }
      }
    }

    console.log(`\n✨ Nettoyage terminé: ${fixedCount} articles corrigés`)
    console.log(`📈 Articles total: ${posts.length}`)

    await mongoose.disconnect()
    console.log('\n✅ Déconnecté de MongoDB')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }
}

fixAllArticles()
