# TIPS-26 Frontend (MVP)

WM 2026 Vorhersage-App nach Spec §2.2 (Pure Frontend, Next.js + TypeScript).
Referenz-Prototyp liegt im Repo-Root unter `wm2026-vorhersage.html`.

## Stack

- **Next.js 15** (App Router, Turbopack)
- **React 19** + **TypeScript 5**
- **Tailwind 4** (CSS-Tokens via `@theme inline`)
- **Vitest** für Unit-Tests der Algorithmen

## Setup

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
```

## Scripts

| Script              | Zweck                              |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Dev-Server (Turbopack)             |
| `npm run build`     | Production Build                   |
| `npm run start`     | Production-Server                  |
| `npm run lint`      | ESLint (next/core-web-vitals)      |
| `npm test`          | Vitest single run                  |
| `npm run test:watch`| Vitest watch mode                  |

## Struktur

```
app/                Next.js App Router (8 Routen)
components/layout/  PhoneFrame, StatusBar, AppHeader, BottomNav
lib/types/          TypeScript-Datenmodelle      (Phase 2)
lib/data/           Teams, Spielplan, Quoten     (Phase 2)
lib/algorithms/     v1, v2, Monte-Carlo, etc.    (Phase 2)
tests/              Vitest-Suites                 (Phase 2)
```

## Implementierungs-Phasen

- **Phase 1 ✅** Skelett: 8 Stub-Routen, Phone-Frame, Bottom-Nav, Design-Tokens, Vitest-Pipeline.
- **Phase 2** Algorithmen + Daten + Tests (1:1 aus HTML-Prototyp portiert, mit Vitest abgesichert).
- **Phase 3** UI pro Tab (Setup → Gruppen → Spiele → Ranking → Home → DFB → Edge → Stabilität).
- **Phase 4** Loading-Overlay + PWA-Manifest + Polish.
- **Phase 5** Web Worker für Monte-Carlo + Vercel-Deploy.
