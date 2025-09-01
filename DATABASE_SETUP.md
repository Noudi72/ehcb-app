# Entwicklungsumgebung Setup

## Lokale Datenbank

Die App verwendet `json-server` mit der Datei `db.json` als lokale Entwicklungsdatenbank.

### Setup

1. **Erste Installation:**
   ```bash
   cp db.template.json db.json
   ```

2. **Server starten:**
   ```bash
   npm run dev:backend
   ```

### Wichtige Hinweise

- `db.json` ist in `.gitignore` enthalten und wird NICHT in Git gespeichert
- Lokale Änderungen (gelöschte Umfragen, neue Daten) bleiben beim Git Pull/Push erhalten
- Bei Problemen: `cp db.template.json db.json` und neu starten

### Produktion

In der Produktionsumgebung sollte eine richtige Datenbank (PostgreSQL, MongoDB, etc.) verwendet werden statt der JSON-Datei.
