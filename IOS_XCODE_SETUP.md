# iOS & Xcode Setup Guide - EHC Biel Spirit App 🍎

## Übersicht

Diese App ist derzeit eine **Progressive Web App (PWA)**, die auf iOS-Geräten über Safari funktioniert. Diese Anleitung erklärt, wo du verschiedene Tokens und Zertifikate für die iOS-Entwicklung findest.

## 🔑 Tokens & Zertifikate für Xcode/iOS

### 1. Apple Developer Program (Erforderlich für App Store)

**Was du brauchst:**
- Apple Developer Account (99€/Jahr)
- Entwicklerzertifikate
- Provisioning Profiles

**Wo du sie findest:**
1. **Apple Developer Portal**: https://developer.apple.com/account/
2. **Certificates, Identifiers & Profiles** → **Certificates**
3. **Download** der Zertifikate (.p12 Dateien)
4. **Installation** in Xcode via Xcode → Preferences → Accounts

### 2. App Store Connect API Key

**Für automatisierte Uploads und CI/CD:**

**Wo du ihn findest:**
1. **App Store Connect**: https://appstoreconnect.apple.com/
2. **Users and Access** → **Keys** → **App Store Connect API**
3. **Generate API Key** (Rolle: Developer oder App Manager)
4. **Download** der .p8 Datei (nur einmal möglich!)

**Wichtige Informationen:**
- **Key ID**: Zeigt sich in der Liste
- **Issuer ID**: Users and Access → Keys (oben rechts)
- **Private Key**: Die .p8 Datei

### 3. GitHub Personal Access Token

**Für Repository-Zugriff in Xcode:**

**Wo du ihn findest:**
1. **GitHub**: https://github.com/settings/tokens
2. **Generate new token (classic)**
3. **Scopes auswählen**: `repo`, `read:org`
4. **Token kopieren** (wird nur einmal angezeigt!)

**In Xcode verwenden:**
- Xcode → Preferences → Accounts → Add Account → GitHub
- Username + Personal Access Token eingeben

### 4. Push Notification Certificates

**Für iOS Push Notifications:**

**Apple Push Notification Service (APNs):**
1. **Apple Developer Portal** → **Certificates**
2. **Add Certificate** → **Apple Push Notification service SSL**
3. **App ID auswählen** (muss zuerst erstellt werden)
4. **CSR hochladen** (von Keychain Access generiert)
5. **Download** und Installation des Zertifikats

## 📱 PWA zu nativer iOS App konvertieren

### Option 1: Capacitor (Empfohlen)

```bash
# Capacitor installieren
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios

# Capacitor initialisieren
npx cap init

# iOS Platform hinzufügen
npx cap add ios

# Build und Sync
npm run build
npx cap sync

# Xcode öffnen
npx cap open ios
```

### Option 2: PWA2Native Services

**Alternative ohne native Entwicklung:**
- **PWA Builder**: https://pwabuilder.com/
- **Automatische Konvertierung** der PWA zu nativer App
- **App Store Package** generieren

## 🚀 Deployment Setup

### Xcode Cloud (CI/CD)

**Workflow-Setup:**
1. **Xcode** → **Product** → **Xcode Cloud** → **Create Workflow**
2. **Repository verbinden** (GitHub Token erforderlich)
3. **Environment Variables** setzen:
   - `DEEPL_API_KEY`
   - `VITE_API_BASE_URL`

### GitHub Actions für iOS

**Beispiel Workflow (.github/workflows/ios.yml):**

```yaml
name: iOS Build
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Xcode
        uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: '15.1'
          
      - name: Build iOS App
        run: |
          # Capacitor build commands
          npm ci
          npm run build
          npx cap sync ios
          xcodebuild -workspace ios/App/App.xcworkspace \
                     -scheme App \
                     -destination 'generic/platform=iOS' \
                     build
```

## 🔐 Sicherheit & Best Practices

### Token-Verwaltung

**✅ Sicher:**
- Environment Variables in Xcode/CI
- Keychain für lokale Entwicklung
- GitHub Secrets für Actions

**❌ Niemals:**
- Tokens in Source Code committen
- Screenshots von Tokens teilen
- Tokens in Slack/E-Mail

### Zertifikat-Management

**Team-Entwicklung:**
1. **Shared Signing** über Apple Developer Portal
2. **Automatic Signing** in Xcode aktivieren
3. **Team ID** in Projektkonfiguration setzen

## 📋 Checkliste für iOS Setup

### Vorbereitung
- [ ] Apple Developer Account ($99/Jahr)
- [ ] Xcode installiert (Mac erforderlich)
- [ ] Git/GitHub konfiguriert

### Zertifikate & Profile
- [ ] Development Certificate erstellt
- [ ] Distribution Certificate erstellt
- [ ] App ID registriert
- [ ] Provisioning Profiles erstellt

### App Store Connect
- [ ] App in App Store Connect erstellt
- [ ] API Key generiert und sicher gespeichert
- [ ] Metadata und Screenshots vorbereitet

### Repository Setup
- [ ] GitHub Personal Access Token erstellt
- [ ] Xcode mit Repository verbunden
- [ ] iOS Platform hinzugefügt (Capacitor)

## 🆘 Häufige Probleme

### "No valid signing identity found"
**Lösung:** Development Certificate in Xcode installieren
- Xcode → Preferences → Accounts → Manage Certificates

### "Failed to register bundle identifier"
**Lösung:** App ID im Developer Portal überprüfen
- developer.apple.com → Identifiers

### "Push notifications not working"
**Lösung:** APNs Certificate konfigurieren
- Capabilities → Push Notifications aktivieren

## 📞 Support

**Bei Fragen:**
- **Team**: nguyaz@ehcb.ch
- **Apple Developer Support**: https://developer.apple.com/contact/
- **GitHub Support**: https://support.github.com/

---

## 🏒 Nächste Schritte

1. **Apple Developer Account** beantragen (falls noch nicht vorhanden)
2. **Capacitor Setup** durchführen für native iOS App
3. **Push Notifications** für iOS konfigurieren
4. **App Store Connect** App erstellen
5. **TestFlight Beta** für Team-Tests

**Erfolg!** Mit dieser Anleitung solltest du alle benötigten Tokens und Zertifikate für die iOS-Entwicklung mit der EHC Biel Spirit App finden und konfigurieren können.