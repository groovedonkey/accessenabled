# AccessEnabled

A website & physical-location **accessibility audit platform**. Enter a client URL, run an automated scan (headless Chrome + axe-core), and the app pre-fills a WCAG-based checklist with **Passed / Failed / Manual** results that you confirm and annotate — then export a branded PDF report.

Built to run on an **iPad Pro (Chrome)** as an installable PWA, backed by **Firebase** (Auth, Firestore, Cloud Functions, Hosting, Storage).

- **Project:** `accessenabled-3e90e`
- **Repo:** https://github.com/groovedonkey/accessenabled
- **Standards:** WCAG 2.1 / 2.2 (A & AA), ADA Title III, Section 508, EAA, ACA + legal crosswalk

---

## Architecture

| Layer | Tech |
|-------|------|
| Frontend | Vite + React 18, React Router, Lucide icons, `vite-plugin-pwa` |
| Auth | Firebase Auth (Google sign-in) |
| Database | Cloud Firestore (`audits` collection, owned per-user) |
| Scan engine | Firebase **Cloud Functions v2** running **Puppeteer (headless Chrome) + axe-core** |
| Hosting | Firebase Hosting (SPA) |
| Reports | Browser print-to-PDF (works on iPad/Chrome, no extra deps) |

### How a website audit works
1. Enter a URL (and optional client name) on the dashboard.
2. App creates an `audit` doc and calls the `scanUrl` Cloud Function.
3. The function loads the page in headless Chrome, injects **axe-core**, runs WCAG 2.0/2.1/2.2 A & AA rule sets, plus custom detectors (accessibility-statement link, overlay-widget reliance).
4. `src/scanMapper.js` maps axe rule results to each checklist line item:
   - rule **violation** → **Failed**
   - rule **pass** → **Passed**
   - rule **incomplete** / scan-assisted item → **Manual review**
   - no automatable rule → **Manual review**
5. You review, override any box, add notes, and **Export** a PDF report.

The checklist data model lives in `src/checklist.js` — every item carries its WCAG ref, level, legal scope, `mode` (`auto`/`semi`/`manual`) and the axe rule ids it maps to.

---

## Prerequisites

- Node 20+ and npm
- Firebase CLI: `npm i -g firebase-tools` (already installed)
- A Firebase project on the **Blaze (pay-as-you-go)** plan — required because the scan
  Cloud Function makes outbound network requests and runs headless Chrome. Light usage
  stays within the generous free tier.

---

## Setup

```bash
# 1. Install frontend deps
npm install

# 2. Install Cloud Function deps
npm --prefix functions install

# 3. Configure the web app keys
cp .env.example .env.local
# then fill VITE_FB_* values from Firebase Console > Project settings > Your apps (Web)

# 4. Log in / select the project
firebase login
firebase use accessenabled-3e90e
```

In the Firebase Console, enable:
- **Authentication → Sign-in method → Google**
- **Firestore Database** (production mode)
- **Storage**
- Upgrade the project to the **Blaze** plan (needed for Functions egress + Puppeteer).

---

## Develop

```bash
npm run dev          # Vite dev server at http://localhost:5173
npm run emulators    # optional: Firebase emulators (auth/firestore/functions)
```

## Deploy

```bash
npm run deploy             # build + deploy hosting, functions, rules
# or individually:
npm run deploy:hosting
npm run deploy:functions
```

---

## Project layout

```
accessenabled/
├─ index.html
├─ vite.config.js            # Vite + PWA config
├─ firebase.json             # hosting / functions / firestore / storage
├─ .firebaserc               # default project: accessenabled-3e90e
├─ firestore.rules           # audits are private per owner uid
├─ storage.rules
├─ public/                   # icons, favicon, manifest assets
├─ functions/
│  ├─ index.js               # scanUrl: Puppeteer + axe-core engine
│  └─ package.json
└─ src/
   ├─ firebase.js            # SDK init (reads VITE_FB_* env)
   ├─ checklist.js           # master WCAG checklist + axe rule mapping
   ├─ scanMapper.js          # axe results -> Pass/Fail/Manual per item
   ├─ auditService.js        # Firestore CRUD + scanUrl callable
   ├─ exportPdf.js           # printable report
   ├─ AuthContext.jsx
   ├─ App.jsx
   ├─ pages/                 # Login, Dashboard, AuditView
   └─ components/            # Layout, ChecklistSection, ChecklistItem, ScoreBadge
```

---

## Roadmap ideas
- **Physical location audits**: add an `auditType` of `physical` with an on-site checklist (entrances, parking, signage, restrooms) — the data model already supports a `type` field.
- **Multi-page crawl**: scan several URLs per client in one audit.
- **Screenshot evidence**: capture failing elements via Puppeteer into Storage.
- **VPAT / ACR generator** from completed audits.
- **Client portal** to share read-only reports.
