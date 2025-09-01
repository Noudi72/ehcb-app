# EHC Biel-Bienne Spirit Team-App

Kurze Übersicht und Betriebsanleitung (Deutsch).

## Live
- Frontend (GitHub Pages): https://noudi72.github.io/ehcb-app/
- Backend (Railway): https://ehcb-app-production.up.railway.app/

## Entwicklung (Lokal)
- Frontend starten: npm run dev
- Backend starten: npm run backend
- Production Build: npm run build

## Deployment
- Frontend wird automatisch via GitHub Actions nach main → GitHub Pages deployed.
- Vite-Base ist auf /ehcb-app/ gesetzt (Projektseite). Service Worker und Router nutzen BASE_URL korrekt.
- Backend läuft auf Railway (Node 20), bindet 0.0.0.0 und hat Health-Endpoints (/healthz, /api/health).

## API-Basis (Frontend)
- Automatik: In Produktion auf github.io wird die Railway-URL genutzt.
- Override (ohne Rebuild):
	- Setzen: localStorage.setItem('API_BASE_URL', 'https://deine-api.example.com')
	- Entfernen: localStorage.removeItem('API_BASE_URL')

## Übersetzung (DeepL)
- Client nutzt DeepL via Backend-Proxy (/api/translate). Bei Fehlern automatischer Mock-Fallback.
- Client-Seite: Throttling (max. 2 parallele Requests, kleiner Jitter) + In-Flight-Dedupe.
- Server-Seite: In-Memory LRU-Cache (TTL 7 Tage, Standard max. 3000 Einträge) + Dedupe + Retry bei 429/5xx.
- Railway-Variable: DEEPL_API_KEY (Free-Key → api-free.deepl.com, Pro-Key → api.deepl.com wird automatisch erkannt).
- Optional anpassbar (Env): TRANSLATION_CACHE_TTL_MS, TRANSLATION_CACHE_MAX.

## PWA
- Service Worker unter /ehcb-app/sw.js, automatische Registrierung.
- Installierbar über Browser (Install-Prompt) und Homescreen.

## Tech-Stack
- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js (Express + JSON Server)
- Deployment: GitHub Pages, Railway

## iOS & Xcode Setup 🍎
Für iOS-Entwicklung und Xcode-Tokens: siehe [IOS_XCODE_SETUP.md](./IOS_XCODE_SETUP.md)

## Support
Fragen/Probleme: nguyaz@ehcb.ch

—
EHC Biel-Bienne – Get stronger every day! 🏒
