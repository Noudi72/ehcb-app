# Deployment Checklist für EHC Biel-Bienne App

## ✅ Vor dem Deployment:
- [ ] Domain gekauft: ehcb-spirit.ch
- [ ] GitHub Repository erstellt
- [ ] Build erfolgreich getestet: `npm run build`

## ✅ Vercel Setup (Frontend):
- [ ] Bei Vercel angemeldet
- [ ] Repository mit Vercel verknüpft
- [ ] Custom Domain hinzugefügt: ehcb-spirit.ch
- [ ] Environment Variable gesetzt: VITE_API_BASE_URL=https://api.ehcb-spirit.ch

## ✅ Railway Setup (Backend):
- [ ] Bei Railway angemeldet
- [ ] Repository mit Railway verknüpft
- [ ] Start Command gesetzt: `node server.cjs`
- [ ] Environment Variables gesetzt: NODE_ENV=production, PORT=3001

## ✅ DNS-Konfiguration:
- [ ] A Record: @ → Vercel IP
- [ ] CNAME: www → ehcb-spirit.ch.vercel.app
- [ ] CNAME: api → railway-backend-url

## ✅ Testing:
- [ ] Frontend erreichbar: https://ehcb-spirit.ch
- [ ] Backend erreichbar: https://api.ehcb-spirit.ch
- [ ] PWA-Installation funktioniert
- [ ] Push Notifications funktionieren
- [ ] File Uploads funktionieren

## ✅ Nach dem Deployment:
- [ ] SSL-Zertifikate aktiv
- [ ] Performance-Test durchgeführt
- [ ] Alle Features getestet
- [ ] Team informiert über neue URL

## 🌐 Live URLs:
- Frontend: https://ehcb-spirit.ch
- Backend: https://api.ehcb-spirit.ch
- Admin: https://ehcb-spirit.ch/coach
