#!/bin/bash
echo "🚀 GitHub Repository Push"
echo "========================"

# Repository URL korrigieren falls nötig
git remote set-url origin https://github.com/Noudj72/ehcb-app.git

echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Erfolgreich gepusht!"
    echo ""
    echo "🌐 Nächste Schritte:"
    echo "1. Gehe zu: https://github.com/Noudj72/ehcb-app"
    echo "2. Klicke auf 'Settings' tab"
    echo "3. Scrolle zu 'Pages' section" 
    echo "4. Source: 'GitHub Actions' auswählen"
    echo "5. Warte auf automatisches Deployment (2-3 Min)"
    echo ""
    echo "📱 Deine App wird verfügbar sein unter:"
    echo "https://noudj72.github.io/ehcb-app"
else
    echo "❌ Push fehlgeschlagen!"
    echo ""
    echo "🔧 Lösungsschritte:"
    echo "1. Repository auf GitHub erstellen: https://github.com/new"
    echo "2. Repository Name: ehcb-app"  
    echo "3. Public auswählen"
    echo "4. NICHT 'Initialize with README' ankreuzen"
    echo "5. Dann dieses Script nochmal laufen lassen"
fi
