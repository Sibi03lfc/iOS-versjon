# 🍎 SparkNorge – Komplett App Store-guide

Steg-for-steg fra HTML-fil til godkjent iOS-app.

---

## Hva som er gjort i koden (allerede ferdig)

| Fil | Hva | Krav |
|-----|-----|------|
| `index.html` | CSP meta-tag, offline-banner, privacy-lenke, slett-konto | Guideline 5.1.1(v), 4.2 |
| `manifest.json` | Fullstendig PWA-manifest med alle ikonstørrelser | Installability |
| `sw.js` | Service Worker med offline-støtte og push-varsler | Guideline 4.2 |
| `privacy.html` | Personvernerklæring på norsk | Guideline 5.1 |
| `capacitor.config.json` | Capacitor 7-konfig for iOS | App-binding |
| `Info.plist.additions.xml` | Alle UsageDescription-nøkler | iOS-krav |
| `PrivacyInfo.xcprivacy` | Apple Privacy Manifest (obligatorisk mai 2024+) | App Store Connect |

---

## Steg 1 — Verktøy du trenger

```bash
# Krav: Mac med macOS Sonoma/Sequoia
xcode-select --install           # Installer Xcode CLI
# Last ned Xcode 16 fra App Store (gratis, ~15 GB)

# Node.js (bruk nvm eller nodejs.org)
node --version   # bør være 18+

# Installer Capacitor
npm install -g @capacitor/cli
```

---

## Steg 2 — Apple Developer konto

1. Gå til **developer.apple.com/programs**
2. Registrer med Apple-ID → kost **99 USD/år**
3. Vent 1–2 dager på godkjenning
4. Gå til **Certificates, Identifiers & Profiles**
5. Opprett ny **App ID**: `no.sparknorge.app`
   - Enable: **Push Notifications**, **Associated Domains**

---

## Steg 3 — Sett opp Capacitor-prosjektet

```bash
# Naviger til mappen med index.html
cd /path/to/sparknorge

# Initialiser Capacitor (bruk verdier fra capacitor.config.json)
npx cap init SparkNorge no.sparknorge.app --web-dir .

# Legg til iOS-plattform
npx cap add ios

# Kopier web-filer til native prosjekt
npx cap sync ios
```

---

## Steg 4 — Plasser de ekstra filene

```bash
# Privacy Manifest (OBLIGATORISK siden mai 2024)
cp PrivacyInfo.xcprivacy ios/App/App/PrivacyInfo.xcprivacy

# Åpne Info.plist.additions.xml og kopier nøklene inn i:
open ios/App/App/Info.plist
# (legg til nøkler fra Info.plist.additions.xml manuelt i Xcode)
```

---

## Steg 5 — Generer ikoner (VIKTIG)

Apple krever ikoner i **eksakt** disse størrelsene. Bruk ett masterikon (1024×1024 PNG):

```bash
# Installer verktøy
npm install -g @capacitor/assets

# Plasser masterikon her:
mkdir -p assets
cp din-logo-1024x1024.png assets/icon.png

# Generer alle størrelser automatisk
npx capacitor-assets generate --iconBackgroundColor '#080c18'
```

**Størrelser som kreves:**
| Fil | Størrelse | Bruk |
|-----|-----------|------|
| `icon-1024.png` | 1024×1024 | App Store |
| `icon-180.png`  | 180×180   | iPhone Retina (@3x) |
| `icon-167.png`  | 167×167   | iPad Pro |
| `icon-152.png`  | 152×152   | iPad Retina |
| `icon-120.png`  | 120×120   | iPhone |

**OBS:** Ikonet må IKKE ha gjennomsiktig bakgrunn (Apple avviser dette).

---

## Steg 6 — Skjermbilder for App Store

Du trenger minst **3 skjermbilder** per skjermstørrelse:

| Enhet | Oppløsning |
|-------|------------|
| iPhone 6.9" (iPhone 16 Pro Max) | 1320×2868 px |
| iPhone 6.7" (iPhone 15 Plus)    | 1290×2796 px |
| iPad Pro 13"                    | 2064×2752 px |

**Enkleste løsning:** Bruk Xcode Simulator
```bash
npx cap open ios    # åpner Xcode
# Velg iPhone 16 Pro Max simulator
# Product → Run
# Ta skjermbilder: Cmd+S i simulator
```

---

## Steg 7 — App Store Connect metadata

Gå til **appstoreconnect.apple.com**:

```
App-navn:          SparkNorge
Undertittel:       Elsparkesykkel i Norge
Kategori:          Navigation (primær) / Travel (sekundær)
Alder:             4+ (ingen vokseninnhold)
Pris:              Gratis
URL til personvern: https://sparknorge.no/privacy.html

Nøkkelord (100 tegn):
sparkesykkel,elsparkesykkel,voi,bolt,ryde,dott,oslo,trondheim,kart,mikromobilitet

Beskrivelse (4000 tegn):
SparkNorge er din alt-i-ett app for elsparkesykler i Norge.

🗺️ LIVE KART
Se alle tilgjengelige sparkesykler fra Voi, Bolt, Ryde og Dott
direkte på kartet – oppdatert hvert minutt.

🚶 GANGRUTE
Appen beregner faktisk gangrute til nærmeste sparkesykkel –
ikke bare rett linje. Se nøyaktig vei og gangtid.

💸 SAMMENLIGN PRISER
Oppdaterte priser for alle leverandører (2025):
• Voi: 10 kr oppstart + 3 kr/min
• Bolt: 0–5 kr oppstart + 2,5 kr/min  
• Ryde: 5 kr oppstart + 2,5 kr/min
• Dott: 12 kr oppstart + 3 kr/min (Trondheim)

📷 QR-SKANNER
Skann QR-koden på sykkelen direkte i appen – åpner riktig
leverandør automatisk.

🏙️ BYER
Oslo, Bergen, Trondheim, Stavanger, Kristiansand, Lillestrøm,
Fredrikstad og Drammen.

📋 TRONDHEIM-SESONG
Dott (tidl. TIER), Voi og Ryde: 15. mars – 1. desember 2025 og 2026.

📋 OSLO-REGLER
Voi, Bolt og Ryde er godkjente apr 2025–mar 2027.
Stengt kl. 23:00–05:00.

Personvern: Ingen data lagres eksternt. GPS brukes kun lokalt.
```

---

## Steg 8 — Build og upload

```bash
# I Xcode: velg riktig signing & team
# Product → Archive
# Distributor → App Store Connect → Upload

# Eller via CLI med Fastlane (avansert):
gem install fastlane
fastlane init
fastlane deliver
```

---

## Steg 9 — App Privacy Labels i App Store Connect

Under **App Privacy** i App Store Connect, merk av:

| Datakategori | Samlet? | Koblet til bruker? | Sporing? |
|---|---|---|---|
| Nøyaktig posisjon | Ja | Nei | Nei |
| Brukerinnhold (navn/by) | Ja | Nei | Nei |
| Bruksdata | Nei | – | – |
| Diagnostikk | Nei | – | – |

---

## Steg 10 — Vanlige avvisningsgrunner og løsninger

| Avvisningsgrunn | Løsning |
|---|---|
| **4.2** – Lite mer enn nettside | Sørg for at GPS-tillatelse, QR-kamera og offline-modus fungerer native |
| **5.1.1** – Mangler slett-konto | ✅ Lagt til i appen under Profil → Innstillinger |
| **5.1.2** – Uklar personvern-URL | ✅ `privacy.html` er lenket fra appen og `capacitor.config.json` |
| **2.1** – App krasjer ved review | Test på ekte iPhone, ikke bare simulator |
| **2.3.3** – Placeholder-innhold | Fjern demo-tekster, bruk ekte data fra Worker-URL |
| **1.5** – Mangler personvernerklæring | ✅ Lagt til i App Store Connect-metadata |
| Privacy Manifest mangler | ✅ `PrivacyInfo.xcprivacy` er klar |
| Ikoner mangler/feil format | Generer med `@capacitor/assets`, transparent bakgrunn er IKKE tillatt |

---

## Test-konto for Apple Review

Apple trenger en fungerende konto for å teste appen. Legg ved:

```
I "Notes to reviewer" i App Store Connect:

Demo-modus: Trykk "Demo-modus" i oppsett-dialogen (ingen Worker-URL nødvendig)
Brukernavn: demo@sparknorge.no  
Passord: SparkDemo2025!

Appen krever ingen innlogging – all data lagres lokalt.
```

---

## Estimert tidslinje

| Steg | Tid |
|------|-----|
| Apple Developer-konto | 1–2 dager |
| Capacitor-oppsett | 2–4 timer |
| Ikoner og skjermbilder | 2–4 timer |
| App Store Connect metadata | 1–2 timer |
| Apple Review | 24–48 timer |
| **Totalt** | **~3–4 dager** |

---

## Kostnad

| Post | Pris |
|------|------|
| Apple Developer Program | 99 USD/år |
| Mac (hvis du ikke har) | Kan leie via MacStadium fra ~30 USD/mnd |
| Utvikling (Capacitor) | Gratis |
| **Totalt år 1** | **~99–150 USD** |

---

*SparkNorge v2.1 · mars 2025 · Alle Apple-krav oppfylt*
