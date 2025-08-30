#!/bin/bash
# EHC Biel-Bienne App Deployment Script

echo "🚀 EHC Biel-Bienne App Deployment"
echo "================================="

# Domain-Konfiguration
DOMAIN_NAME="ehcb-spirit.ch"
API_SUBDOMAIN="api.$DOMAIN_NAME"
FRONTEND_URL="https://$DOMAIN_NAME"
BACKEND_URL="https://$API_SUBDOMAIN"

echo "📍 Domain: $DOMAIN_NAME"
echo "🔗 Frontend: $FRONTEND_URL"
echo "🔗 Backend: $BACKEND_URL"

# 1. Build erstellen
echo ""
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build erfolgreich!"
else
    echo "❌ Build fehlgeschlagen!"
    exit 1
fi

# 2. Environment Variables ausgeben
echo ""
echo "🔧 Environment Variables für Deployment:"
echo "VITE_API_BASE_URL=$BACKEND_URL"
echo ""

# 3. Nächste Schritte
echo "📋 Nächste Schritte:"
echo "1. Domain '$DOMAIN_NAME' bei einem Provider kaufen"
echo "2. Bei Vercel anmelden und Repository verknüpfen"
echo "3. Bei Railway anmelden und Backend deployen"
echo "4. DNS-Records konfigurieren:"
echo "   A Record: @ → Vercel IP"
echo "   CNAME: api → railway-app-url"
echo "5. Environment Variable VITE_API_BASE_URL=$BACKEND_URL setzen"
echo ""
echo "🎉 Fertig für Deployment!"

# 4. Deployment-Checklist erstellen
cat > deployment-checklist.md << EOF
# Deployment Checklist für EHC Biel-Bienne App

## ✅ Vor dem Deployment:
- [ ] Domain gekauft: $DOMAIN_NAME
- [ ] GitHub Repository erstellt
- [ ] Build erfolgreich getestet: \`npm run build\`

## ✅ Vercel Setup (Frontend):
- [ ] Bei Vercel angemeldet
- [ ] Repository mit Vercel verknüpft
- [ ] Custom Domain hinzugefügt: $DOMAIN_NAME
- [ ] Environment Variable gesetzt: VITE_API_BASE_URL=$BACKEND_URL

## ✅ Railway Setup (Backend):
- [ ] Bei Railway angemeldet
- [ ] Repository mit Railway verknüpft
- [ ] Start Command gesetzt: \`node server.cjs\`
- [ ] Environment Variables gesetzt: NODE_ENV=production, PORT=3001

## ✅ DNS-Konfiguration:
- [ ] A Record: @ → Vercel IP
- [ ] CNAME: www → $DOMAIN_NAME.vercel.app
- [ ] CNAME: api → railway-backend-url

## ✅ Testing:
- [ ] Frontend erreichbar: $FRONTEND_URL
- [ ] Backend erreichbar: $BACKEND_URL
- [ ] PWA-Installation funktioniert
- [ ] Push Notifications funktionieren
- [ ] File Uploads funktionieren

## ✅ Nach dem Deployment:
- [ ] SSL-Zertifikate aktiv
- [ ] Performance-Test durchgeführt
- [ ] Alle Features getestet
- [ ] Team informiert über neue URL

## 🌐 Live URLs:
- Frontend: $FRONTEND_URL
- Backend: $BACKEND_URL
- Admin: $FRONTEND_URL/coach
EOF

echo "📝 Deployment-Checklist erstellt: deployment-checklist.md"
