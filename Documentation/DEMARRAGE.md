# Guide de démarrage local - MyFlip

## Prérequis

### 1. Installer MongoDB

1. Téléchargez MongoDB Community Server : https://www.mongodb.com/try/download/community
2. Installez-le avec les options par défaut
3. MongoDB démarre automatiquement en tant que service Windows

### 2. Installer Node.js
- Téléchargez depuis https://nodejs.org (version LTS recommandée)

## Lancement du projet

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

## Récupérer des articles

### Option 1 : Via le script automatique (MongoDB requis)

```powershell
cd BackAPI
npm run populate
```

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
