# EHC Biel-Bienne App Deployment Guide

## Frontend Deployment (GitHub Pages oder Vercel)

### GitHub Pages (empfohlen für dieses Frontend)
1. GitHub Actions ist vorbereitet: `.github/workflows/deploy.yml`
2. Projekt-Basis ist für Pages konfiguriert (`vite.config.js: base`, `App.jsx: basename`)
3. Setze in Repo Settings → Secrets → Actions:
   - `VITE_API_BASE_URL` = URL deines Backends (z. B. Render)
4. Push auf `main` triggert den Build und Pages-Deploy

Öffnen: `https://<github-username>.github.io/ehcb-app/`

### Vercel (Alternative)
1. Bei Vercel anmelden: https://vercel.com
2. Repository verknüpfen
3. Build-Settings wie unten

### Environment Variables für Vercel:
```
VITE_API_BASE_URL=https://<dein-backend-host>
```

### Build-Befehle:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Backend Deployment (Render – empfohlen)

Render eignet sich besser als serverlose Plattformen für einen dauerhaften Node/Express-Server mit Uploads und einer JSON-DB.

### Blueprint-Deployment
Dieses Repo enthält `render.yaml`. Schritte:
1. In Render → New → Blueprint → GitHub-Repo wählen
2. Service erstellt sich automatisch
3. Unter Environment Variablen setzen:
   - `NODE_ENV=production`
   - `DB_FILE=/data/db.json` (kommt aus `render.yaml`)
   - `UPLOAD_DIR=/data/uploads` (kommt aus `render.yaml`)
   - `DEEPL_API_KEY=<dein_secret>`
4. Deploy starten

### Was die App erwartet
- Der Server liest:
  - `DB_FILE` (Standard: `db.json` im Repo; wird bei erstem Start in `/data/db.json` kopiert)
  - `UPLOAD_DIR` (Standard: `public/uploads`; auf Render: `/data/uploads`)
  - `DEEPL_API_KEY` (Pflicht für Live-Übersetzungen)
- Static Uploads werden über `/uploads` ausgeliefert

### Start- und Build-Befehle
- Build: `npm ci`
- Start: `node server.cjs`

### Persistenz
- Eine Disk `data` ist in `render.yaml` konfiguriert (1 GB)
- Pfad: `/data` (für DB und Uploads)

## Backend Deployment (Railway – optional)

### Vorbereitung:
1. Bei Railway anmelden: https://railway.app
2. GitHub Repository verknüpfen
3. Node.js Template wählen

### Environment Variables für Railway:
```
NODE_ENV=production
# PORT wird von Railway gesetzt; nicht überschreiben
```

### Start-Befehl:
```
node server.cjs
```

## Domain Setup

### Custom Domain (Optional):
1. Domain bei einem Provider kaufen (z.B. Namecheap, GoDaddy)
2. DNS-Einstellungen:
   - Frontend: GitHub Pages (benutzername.github.io) oder CNAME zu Vercel
   - Backend: CNAME zu Render (oder Railway)
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
- GitHub Pages: kostenlos
- Render Free: kostenlos (Sleep möglich)
- Railway Free: limitiert/kostenpflichtig je nach Kontingent

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
