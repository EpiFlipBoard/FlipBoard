# Configuration CI/CD - Script de Setup
# Pour Backend ET Frontend

Write-Host "Configuration du CI/CD pour MyFlip (Backend + Frontend)" -ForegroundColor Cyan
Write-Host ""

# 1. Créer le dossier .github/workflows
Write-Host "Création du dossier .github/workflows..." -ForegroundColor Yellow
if (!(Test-Path ".github")) {
    New-Item -ItemType Directory -Path ".github" -Force | Out-Null
}
if (!(Test-Path ".github\workflows")) {
    New-Item -ItemType Directory -Path ".github\workflows" -Force | Out-Null
}
Write-Host "✅ Dossier créé" -ForegroundColor Green

# 2. Copier les workflows
Write-Host ""
Write-Host "Copie des workflows CI/CD..." -ForegroundColor Yellow

# Backend workflow
if (Test-Path "workflows\ci-cd.yml") {
    Copy-Item "workflows\ci-cd.yml" ".github\workflows\ci-cd.yml" -Force
    Write-Host "Workflow Backend copié" -ForegroundColor Green
} else {
    Write-Host "Fichier workflows\ci-cd.yml introuvable" -ForegroundColor Red
}

# Frontend workflow
if (Test-Path "workflows\frontend-ci-cd.yml") {
    Copy-Item "workflows\frontend-ci-cd.yml" ".github\workflows\frontend-ci-cd.yml" -Force
    Write-Host "Workflow Frontend copié" -ForegroundColor Green
} else {
    Write-Host "Fichier workflows\frontend-ci-cd.yml introuvable" -ForegroundColor Red
}

# 3. Vérifier les dépendances Backend
Write-Host ""
Write-Host "Vérification Backend..." -ForegroundColor Yellow
if (Test-Path "BackAPI") {
    Set-Location "BackAPI"
    if (!(Test-Path "node_modules")) {
        Write-Host "Installation des dépendances Backend..." -ForegroundColor Yellow
        npm install | Out-Null
    }
    Write-Host "Backend OK" -ForegroundColor Green
    Set-Location ..
} else {
    Write-Host "Dossier BackAPI introuvable" -ForegroundColor Yellow
}

# 4. Vérifier les dépendances Frontend
Write-Host ""
Write-Host "Vérification Frontend..." -ForegroundColor Yellow
if (Test-Path "FrontWeb") {
    Set-Location "FrontWeb"
    if (!(Test-Path "node_modules")) {
        Write-Host "Installation des dépendances Frontend..." -ForegroundColor Yellow
        npm install | Out-Null
    }
    Write-Host "Frontend OK" -ForegroundColor Green
    Set-Location ..
} else {
    Write-Host "Dossier FrontWeb introuvable" -ForegroundColor Yellow
}
