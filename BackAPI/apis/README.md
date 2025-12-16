# APIs d'actualités

Ce dossier contient les intégrations avec différentes APIs d'actualités.

## Sources disponibles

### 1. RSS Feeds (Gratuit - Aucune clé requise) ✅
Sources francophones gratuites :
- Le Monde
- Le Figaro
- France Info
- RFI
- L'Express

**Avantages** : Gratuit, pas de limite, sources françaises
**Limites** : Moins de contrôle, qualité variable des images

### 2. NewsAPI (Gratuit avec limites)
- **Site** : https://newsapi.org
- **Inscription** : Gratuite
- **Limites** : 100 requêtes/jour (plan gratuit)
- **Clé requise** : Oui

### 3. The Guardian (Gratuit avec limites)
- **Site** : https://open-platform.theguardian.com
- **Inscription** : Gratuite
- **Limites** : 5000 requêtes/jour
- **Clé requise** : Oui

### 4. New York Times (Gratuit avec limites)
- **Site** : https://developer.nytimes.com
- **Inscription** : Gratuite
- **Limites** : 500 requêtes/jour, 5 requêtes/minute
- **Clé requise** : Oui

## Configuration

Ajoutez les clés API dans votre fichier `.env` :

```env
# API Keys (optionnel - RSS fonctionne sans clés)
NEWSAPI_KEY=votre_cle_newsapi
GUARDIAN_API_KEY=votre_cle_guardian
NYTIMES_API_KEY=votre_cle_nytimes
```

## Utilisation

### Récupérer des articles

```javascript
import { aggregateArticles, fetchAndSaveArticles } from './apis/aggregator.js'
import Post from './models/Post.js'

// Récupérer des articles via RSS (gratuit, pas de clé nécessaire)
const articles = await aggregateArticles({}, {
  sources: ['rss'],
  pageSize: 20
})

// Récupérer et sauvegarder dans la DB
const result = await fetchAndSaveArticles(Post, {
  newsapi: process.env.NEWSAPI_KEY,
  guardian: process.env.GUARDIAN_API_KEY,
  nytimes: process.env.NYTIMES_API_KEY
}, {
  sources: ['rss', 'newsapi'], // Utiliser RSS + NewsAPI
  pageSize: 10
})

console.log(`${result.saved} nouveaux articles, ${result.updated} mis à jour`)
```

## Recommandations

1. **Commencez avec RSS** : C'est gratuit et sans limites
2. **Ajoutez NewsAPI** pour plus de diversité (100 articles/jour gratuits)
3. **Utilisez un CRON job** pour mettre à jour les articles régulièrement
4. **Mettez en cache** les résultats pour éviter les appels répétés

## Exemple de route API

```javascript
// Dans src/routes/posts.js
router.get('/fetch-latest', async (req, res) => {
  const result = await fetchAndSaveArticles(Post, {
    newsapi: process.env.NEWSAPI_KEY,
    guardian: process.env.GUARDIAN_API_KEY,
    nytimes: process.env.NYTIMES_API_KEY
  }, {
    sources: ['rss'],
    pageSize: 20
  })
  
  res.json(result)
})
```
