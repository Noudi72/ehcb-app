—

# EHC Biel-Bienne Spirit Team-App

Kurze Übersicht und Betriebsanleitung (Stand: 09/2025)

## Live
- Frontend: https://noudi72.github.io/ehcb-app/
- Backend/API: Supabase (Cloud Backend, kein Railway/MongoDB mehr)

## Entwicklung (Lokal)
- Frontend starten: `npm run dev`
- Production Build: `npm run build`

## Deployment
- Frontend wird automatisch via GitHub Actions nach main → GitHub Pages deployed.
- Vite-Base ist auf /ehcb-app/ gesetzt (Projektseite). Service Worker und Router nutzen BASE_URL korrekt.
- Backend: Supabase (Datenbank, Auth, Storage, API)

## API-Basis (Frontend)
- Automatik: In Produktion wird die Supabase-URL genutzt.
- Override (ohne Rebuild):
	- Setzen: `localStorage.setItem('API_BASE_URL', 'https://deine-api.example.com')`
	- Entfernen: `localStorage.removeItem('API_BASE_URL')`

## Übersetzung (DeepL & i18next)
- UI-Übersetzungen: i18next (Sprachumschaltung, Lokalisierung, statische Texte)
- Dynamische Inhalte: DeepL API via Backend-Proxy (`/api/translate`), Ergebnisse werden in Supabase gespeichert.
- Railway/Backend-Proxy entfällt, alles läuft über Supabase und Client.

## PWA
- Service Worker unter `/ehcb-app/sw.js`, automatische Registrierung.
- Installierbar über Browser (Install-Prompt) und Homescreen.

## Tech-Stack
- Frontend: React, Vite, Tailwind CSS, i18next
- Backend: Supabase (Postgres, Auth, Storage)
- Deployment: GitHub Pages, Supabase

## Altlasten entfernt
- MongoDB, Cloudinary, Railway, JSON Server, server.js/cjs, test- und Backup-Dateien
- Nur noch moderne Komponenten und Supabase-Integration

## Support
Fragen/Probleme: nguyaz@ehcb.ch

—
EHC Biel-Bienne – Get stronger every day! 🏒
