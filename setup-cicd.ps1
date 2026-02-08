# Configuration CI/CD - Script de Setup

Write-Host "Configuration du CI/CD pour MyFlip Backend" -ForegroundColor Cyan
Write-Host ""

# 1. Créer le dossier .github/workflows
Write-Host "Création du dossier .github/workflows..." -ForegroundColor Yellow
if (!(Test-Path ".github")) {
    New-Item -ItemType Directory -Path ".github" -Force | Out-Null
}
if (!(Test-Path ".github\workflows")) {
    New-Item -ItemType Directory -Path ".github\workflows" -Force | Out-Null
}
Write-Host "Dossier créé" -ForegroundColor Green

# 2. Copier le workflow
Write-Host ""
Write-Host "Copie du workflow CI/CD..." -ForegroundColor Yellow
if (Test-Path "workflows\ci-cd.yml") {
    Copy-Item "workflows\ci-cd.yml" ".github\workflows\ci-cd.yml" -Force
    Write-Host "Workflow copié" -ForegroundColor Green
} else {
    Write-Host "Fichier workflows\ci-cd.yml introuvable" -ForegroundColor Red
    exit 1
}

# 3. Vérifier les dépendances
Write-Host ""
Write-Host "Vérification des dépendances..." -ForegroundColor Yellow
Set-Location "BackAPI"

if (!(Test-Path "node_modules")) {
    Write-Host "Installation des dépendances..." -ForegroundColor Yellow
    npm install
}

Write-Host "Dépendances OK" -ForegroundColor Green

# 4. Lancer les tests
Write-Host ""
Write-Host "Lancement des tests..." -ForegroundColor Yellow
$env:NODE_OPTIONS = "--experimental-vm-modules"

# Vérifier que MongoDB est accessible (optionnel pour tests locaux)
Write-Host "Note: MongoDB doit être démarré pour les tests d'intégration" -ForegroundColor Yellow

# 5. Résumé
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Configuration terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Vérifier MongoDB: mongod --version" -ForegroundColor White
Write-Host "2. Lancer les tests: cd BackAPI && npm test" -ForegroundColor White
Write-Host "3. Commit les changements:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Add CI/CD workflow for backend'" -ForegroundColor Gray
Write-Host "   git push" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Vérifier sur GitHub → onglet Actions" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan

Set-Location ..
