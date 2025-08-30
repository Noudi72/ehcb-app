# Domain Registration Guide für EHC Biel-Bienne App

## Empfohlene Domain-Namen:
1. `ehcb-spirit.ch` (Schweizer Domain, sehr passend)
2. `ehcb-app.com` (International, einfach zu merken)
3. `spiriteam.ch` (Kurz und prägnant)
4. `bielbiennehockey.app` (Beschreibend)

## Schweizer Domain-Anbieter:

### 1. Switch.ch (Offizieller .ch Registrar)
- Website: https://www.switch.ch
- .ch Domain: ~CHF 15/Jahr
- Sehr zuverlässig, Schweizer Standard

### 2. Hostpoint.ch
- Website: https://www.hostpoint.ch
- .ch Domain: ~CHF 12/Jahr
- Guter Service, einfache Verwaltung

### 3. cyon.ch
- Website: https://www.cyon.ch
- .ch Domain: ~CHF 15/Jahr
- Sehr guter Support

## Internationale Anbieter:

### 1. Namecheap.com
- .com Domain: ~$12/Jahr
- Sehr günstig, gute Verwaltung

### 2. Cloudflare.com
- .com Domain: ~$9/Jahr
- At-cost pricing, kein Markup

## Domain-Setup nach Kauf:

### DNS-Konfiguration:
```
# Frontend (www und root)
A Record: @ → Vercel IP
CNAME: www → your-app.vercel.app

# Backend API
CNAME: api → your-backend.railway.app

# Subdomains
CNAME: admin → your-app.vercel.app
```

### SSL/HTTPS:
- Automatisch über Vercel/Railway
- Kostenlose Let's Encrypt Zertifikate

## Empfohlene Struktur:
- **Hauptapp:** `https://ehcb-spirit.ch`
- **API:** `https://api.ehcb-spirit.ch`
- **Admin:** `https://admin.ehcb-spirit.ch` (falls gewünscht)

## Nach Domain-Kauf:
1. Domain bei Vercel hinzufügen
2. DNS-Records konfigurieren
3. API-URL in App anpassen
4. SSL automatisch aktiviert
