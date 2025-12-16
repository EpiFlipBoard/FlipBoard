# Guide de démarrage - MyFlip

## 📋 Prérequis

### 1. Installer MongoDB

**Option A : MongoDB Local (Recommandé pour le développement)**
1. Téléchargez MongoDB Community Server : https://www.mongodb.com/try/download/community
2. Installez-le avec les options par défaut
3. MongoDB démarre automatiquement en tant que service Windows

**Option B : MongoDB Atlas (Cloud gratuit)**
1. Créez un compte sur https://www.mongodb.com/cloud/atlas
2. Créez un cluster gratuit
3. Obtenez votre chaîne de connexion
4. Modifiez `MONGODB_URI` dans `.env` avec votre chaîne de connexion

### 2. Installer Node.js
- Téléchargez depuis https://nodejs.org (version LTS recommandée)

## 🚀 Lancement du projet

### Backend

```powershell
cd BackAPI
npm install
npm run dev
```

Le backend démarre sur http://localhost:4000

### Frontend

```powershell
cd FrontWeb
npm install
npm run dev
```

Le frontend démarre sur http://localhost:5173

## 📰 Récupérer des articles

### Option 1 : Via le script automatique (MongoDB requis)

```powershell
cd BackAPI
npm run populate
```

Ce script récupère automatiquement ~15 articles depuis les flux RSS français (Le Monde, Le Figaro, etc.)

### Option 2 : Via l'API (pendant que le backend tourne)

**PowerShell :**
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/posts/fetch-latest" -Method POST -ContentType "application/json"
```

**Navigateur :**
Utilisez un outil comme Postman ou Thunder Client, ou simplement :
```javascript
fetch('http://localhost:4000/api/posts/fetch-latest', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

### Option 3 : Avec des APIs externes (optionnel)

1. Inscrivez-vous sur les plateformes :
   - NewsAPI : https://newsapi.org (100 articles/jour gratuit)
   - The Guardian : https://open-platform.theguardian.com (5000/jour)
   - NY Times : https://developer.nytimes.com (500/jour)

2. Ajoutez les clés dans `.env` :
```env
NEWSAPI_KEY=votre_cle
GUARDIAN_API_KEY=votre_cle
NYTIMES_API_KEY=votre_cle
```

3. Relancez `npm run populate`

## 🗂️ Structure du projet

```
BackAPI/
├── apis/              # 🆕 Nouvelles intégrations d'APIs
│   ├── newsapi.js     # NewsAPI
│   ├── guardian.js    # The Guardian
│   ├── nytimes.js     # NY Times
│   ├── rss.js         # Flux RSS français (gratuit)
│   ├── aggregator.js  # Agrégation de toutes les sources
│   └── README.md      # Documentation des APIs
├── scripts/           # Scripts de scraping (ancien système)
│   └── populateArticles.js  # 🆕 Script pour peupler la DB
├── src/
│   ├── routes/
│   │   └── posts.js   # 🆕 Nouvelles routes /fetch-latest et /fetch-custom
│   └── ...
└── .env              # Configuration

FrontWeb/
└── src/
    └── pages/
        └── Home.jsx   # Affichage des articles
```

## 🔧 Dépannage

### "MONGODB_URI missing"
→ Créez le fichier `.env` dans BackAPI (déjà fait)

### "Cannot connect to MongoDB"
→ Installez MongoDB ou utilisez MongoDB Atlas

### "No articles displayed"
→ Lancez `npm run populate` pour ajouter des articles

### Port déjà utilisé
→ Changez `PORT` dans `.env`

## 📡 Routes API disponibles

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/posts` | GET | Liste tous les articles |
| `/api/posts/fetch-latest` | POST | Récupère les derniers articles via APIs |
| `/api/posts/fetch-custom` | POST | Récupère des articles personnalisés |
| `/api/posts/:id/like` | POST | Like un article |
| `/api/posts/:id/comments` | GET/POST | Commentaires |

## 🎯 Prochaines étapes

1. ✅ Installer MongoDB
2. ✅ Lancer le backend et frontend
3. ✅ Peupler la base avec des articles
4. 🔄 Configurer un CRON job pour mettre à jour automatiquement
5. 🔄 Ajouter plus de sources d'articles
