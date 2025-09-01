# EHC Biel-Bienne App Deployment Guide

## Deployment auf Vercel (Frontend + API)

Empfohlen: Alles in einem Projekt auf Vercel. Das Frontend wird als statische Seite gebaut, die API-Endpunkte laufen als Vercel Functions unter `/api/*`.

### Vorbereitung
1. Repo auf GitHub pushen
2. Vercel Account erstellen und GitHub verbinden
3. In Vercel: New Project → Importiere dieses Repo

### Environment Variables (Vercel → Project → Settings → Environment Variables)
- `DEEPL_API_KEY` = dein DeepL-Schlüssel (Required für Übersetzungen)
- Optional für Cloudinary (falls du es statt Vercel Blob verwenden willst):
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER`

### Storage für Uploads
- Standard: Vercel Blob wird verwendet. Aktiviere unter Project → Storage → Blob und vergib Lese/Schreibrechte.
- Die Upload-Endpunkte sind:
  - `POST /api/upload/image`
  - `POST /api/upload/video`
  - `POST /api/upload/pdf`
  → Response enthält `url` der hochgeladenen Datei.

### Build Settings
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Start
- Push auf `main` → Vercel baut und deployed automatisch.
- Projekt-URL öffnen (z. B. `https://<projekt>.vercel.app`).

Hinweis: Die App nutzt in Production relative API-URLs (gleiche Domain). In Development weiterhin `http://localhost:3001` aus `src/config/api.js`.

---

## Frontend Deployment (GitHub Pages) – Alternative

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
   - `DEEPL_API_KEY=<dein_secret>`
4. Deploy starten

### Was die App erwartet
- Der Server liest:
  - `DB_FILE` (Standard: `db.json` im Repo; wird bei erstem Start in `/data/db.json` kopiert)
  - `UPLOAD_DIR` (Standard: `public/uploads`; auf Render: `/data/uploads`)
  - `DEEPL_API_KEY` (Pflicht für Live-Übersetzungen)
- Static Uploads werden über `/uploads` ausgeliefert

### Optional: Cloudinary für Uploads (Free-freundlich)
Um im Free-Plan ohne Disks trotzdem persistente Uploads zu haben, nutze Cloudinary.

1. Konto erstellen: https://cloudinary.com/
2. Im Dashboard die Credentials kopieren: Cloud Name, API Key, API Secret
3. In Render beim Backend-Service als Environment Variablen setzen:
   - `CLOUDINARY_CLOUD_NAME=<dein_name>`
   - `CLOUDINARY_API_KEY=<dein_key>`
   - `CLOUDINARY_API_SECRET=<dein_secret>`
   - Optional: `CLOUDINARY_FOLDER=ehcb-app`
4. Redeploy. Ab jetzt speichern die Endpunkte:
   - `POST /api/upload/image` → Cloudinary `resource_type=image`
   - `POST /api/upload/video` → `resource_type=video`
   - `POST /api/upload/pdf` → `resource_type=raw`
5. Response enthält `url` (Cloudinary `secure_url`). Die App kann diese URLs direkt anzeigen/verlinken.

Hinweis: Lokal ohne Cloudinary-Env fallen die Uploads automatisch auf den lokalen Speicher zurück.

### Start- und Build-Befehle
- Build: `npm ci`
- Start: `node server.cjs`

### Persistenz (Free Tier Hinweis)
- Der Render Free-Plan unterstützt keine Disks. Ohne Disk sind Uploads und DB-Änderungen NICHT dauerhaft (gehen bei Redeploy/Neustart verloren).
- Optionen:
  - Upgrade auf Starter-Plan und eine Disk mounten (empfohlen für Persistenz)
  - Externer Speicher für Uploads (z. B. Cloudinary, S3/R2) und externe DB (z. B. Supabase/Postgres)
  - Für Tests/Prototyping: Free ohne Persistenz nutzen

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
Start Command: `npm start` (aus `package.json`).
Runtime/Node: 20 LTS (Repos enthält `engines` und `.nvmrc`).
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

## iOS App Store Deployment

Für die Veröffentlichung als native iOS App:

### Vorbereitung:
1. **iOS Setup durchführen**: Siehe [IOS_XCODE_SETUP.md](./IOS_XCODE_SETUP.md)
2. **Capacitor installieren**: `npm install @capacitor/core @capacitor/cli @capacitor/ios`
3. **iOS Platform hinzufügen**: `npx cap add ios`

### Build für iOS:
1. **Web Build**: `npm run build`
2. **Capacitor Sync**: `npx cap sync`
3. **Xcode öffnen**: `npx cap open ios`
4. **App Store Upload** über Xcode oder CLI

### App Store Connect:
- **Bundle ID**: `ch.ehcb.spirit.app` (empfohlen)
- **App Name**: "EHC Biel Spirit"
- **Kategorie**: Sports
- **Altersfreigabe**: 4+ (Sports apps)

## Support & Troubleshooting:

### Häufige Probleme:
1. CORS-Fehler: Backend CORS-Konfiguration prüfen
2. Build-Fehler: Dependencies und Node.js Version prüfen
3. API-Verbindung: Environment Variables prüfen
4. iOS Build-Fehler: Xcode/Capacitor Setup prüfen

### Helpful Links:
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- PWA Testing: https://web.dev/pwa-checklist/
- iOS Setup: [IOS_XCODE_SETUP.md](./IOS_XCODE_SETUP.md)
- Capacitor Docs: https://capacitorjs.com/docs
