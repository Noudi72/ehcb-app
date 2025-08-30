#!/bin/bash
# GitHub Repository Setup für EHC Biel-Bienne App

echo "🔗 GitHub Repository Setup"
echo "=========================="

# Repository URL (nach dem Erstellen auf GitHub anpassen)
GITHUB_USER="noelguyaz"  # Dein GitHub Username
REPO_NAME="ehcb-app"
REPO_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo "📍 Repository: $REPO_URL"

# Git Remote hinzufügen
git remote add origin $REPO_URL

# Branch auf main setzen
git branch -M main

# Zum GitHub Repository pushen
echo "⬆️ Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Erfolgreich zu GitHub gepusht!"
    echo ""
    echo "🌐 Nächste Schritte:"
    echo "1. Gehe zu: https://github.com/$GITHUB_USER/$REPO_NAME"
    echo "2. Klicke auf 'Settings' tab"
    echo "3. Scrolle zu 'Pages' section"
    echo "4. Source: 'GitHub Actions' auswählen"
    echo "5. Warte auf das automatische Deployment"
    echo ""
    echo "📱 Deine App wird verfügbar sein unter:"
    echo "https://$GITHUB_USER.github.io/$REPO_NAME"
else
    echo "❌ Fehler beim Pushen!"
    echo "Bitte erstelle zuerst das Repository auf GitHub:"
    echo "https://github.com/new"
fi
