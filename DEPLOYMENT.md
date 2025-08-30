# EHC Biel-Bienne App Deployment Guide

## Frontend Deployment (Vercel)

### Vorbereitung:
1. GitHub Repository erstellen und Code pushen
2. Bei Vercel anmelden: https://vercel.com
3. Repository mit Vercel verknüpfen

### Environment Variables für Vercel:
```
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

### Build-Befehle:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Backend Deployment (Railway)

### Vorbereitung:
1. Bei Railway anmelden: https://railway.app
2. GitHub Repository verknüpfen
3. Node.js Template wählen

### Environment Variables für Railway:
```
NODE_ENV=production
PORT=3001
```

### Start-Befehl:
```
node server.cjs
```

## Domain Setup

### Custom Domain (Optional):
1. Domain bei einem Provider kaufen (z.B. Namecheap, GoDaddy)
2. DNS-Einstellungen:
   - Frontend: CNAME zu Vercel
   - Backend: CNAME zu Railway
3. SSL wird automatisch konfiguriert

### Kostenlose Domains:
- Vercel: `your-app.vercel.app`
- Railway: `your-app.railway.app`

## Wichtige Schritte nach Deployment:

### 1. API URLs aktualisieren:
- Frontend muss auf die Railway Backend-URL zeigen
- Push Notifications müssen aktualisiert werden

### 2. Service Worker aktualisieren:
- Neue URLs in `sw.js` eintragen
- Cache-Strategien überprüfen

### 3. Testing:
- PWA-Installation testen
- Push Notifications testen
- File Uploads testen
- Offline-Funktionalität testen

## Monitoring & Wartung

### Logs überwachen:
- Vercel: Build-Logs und Function-Logs
- Railway: Application-Logs

### Performance überwachen:
- Core Web Vitals in Vercel Analytics
- Response Times der API

### Backup:
- Regelmäßige Backups der db.json
- Git-Repository als Code-Backup

## Kosten Übersicht:

### Kostenlose Tier:
- Vercel: Unlimited personal projects
- Railway: $5/Monat (100GB egress, 512MB RAM)

### Pro Tier (wenn nötig):
- Vercel Pro: $20/Monat
- Railway Pro: $20/Monat

## Support & Troubleshooting:

### Häufige Probleme:
1. CORS-Fehler: Backend CORS-Konfiguration prüfen
2. Build-Fehler: Dependencies und Node.js Version prüfen
3. API-Verbindung: Environment Variables prüfen

### Helpful Links:
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- PWA Testing: https://web.dev/pwa-checklist/
