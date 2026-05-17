# TIPS-26 Frontend (MVP)

WM 2026 Vorhersage-App nach Spec §2.2 (Pure Frontend, Next.js + TypeScript).
Referenz-Prototyp liegt im Repo-Root unter `wm2026-vorhersage.html`.

## Stack

- **Next.js 15** (App Router, Turbopack)
- **React 19** + **TypeScript 5**
- **Tailwind 4** (CSS-Tokens via `@theme inline`)
- **Zustand** für State (Konfiguration + Ergebnisse + Loading)
- **Web Worker** für Monte-Carlo & Sensitivity (Main-Thread bleibt frei)
- **Vitest** für deterministische Algorithmen-Tests (Mulberry32 seeded RNG)

## Setup

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
```

In **GitHub Codespaces**: Pfad ist `/workspaces/TIPS26TM/frontend`. Port 3000
wird automatisch weitergeleitet — auf das Popup „In Browser öffnen" klicken.

## Scripts

| Script               | Zweck                          |
| -------------------- | ------------------------------ |
| `npm run dev`        | Dev-Server (Turbopack)         |
| `npm run build`      | Production Build               |
| `npm run start`      | Production-Server              |
| `npm run lint`       | ESLint (next/core-web-vitals)  |
| `npm test`           | Vitest single run              |
| `npm run test:watch` | Vitest watch mode              |

## Struktur

```
app/                  Next.js App Router (8 Routen)
components/layout/    PhoneFrame, StatusBar, AppHeader, BottomNav
components/loading/   LoadingOverlay
components/setup/     Algorithm-Switch, Presets, Slider, Sim-Tiefe, Run-Button
components/results/   Ranking, Groups, Matches, Edge, Sensitivity, Germany, Home
components/ui/        Card, Button, Slider, InfoBanner, AlgorithmBadge
lib/types/            TypeScript-Datenmodelle
lib/data/             Teams (48), Schedule (72), Quoten, Presets, Faktoren
lib/algorithms/       v1, v2, MonteCarlo, Sensitivity, Edge — pure Funktionen
lib/workers/          simulation.worker.ts (Monte-Carlo + Sensitivity off-thread)
lib/hooks/            useRunSimulation, useRunSensitivity
lib/stores/           Zustand-Store
tests/                Vitest-Suites (62 grün)
public/               manifest.json, icon.svg
```

## Implementierungs-Phasen

- **Phase 1 ✅** Skelett: 8 Stub-Routen, Phone-Frame, Bottom-Nav, Design-Tokens, Vitest-Pipeline.
- **Phase 2 ✅** Algorithmen + Daten + Tests (1:1 aus HTML-Prototyp portiert, mit 62 Vitest-Tests abgesichert, Mulberry32 für Determinismus).
- **Phase 3 ✅** UI tab-für-tab (Setup interaktiv, alle Result-Tabs mit Empty-State und Live-Daten aus dem Store, LoadingOverlay).
- **Phase 4 ✅** PWA-Manifest + Icon, Apple-Touch-Icon, Polish.
- **Phase 5 ✅** Web Worker für Monte-Carlo + Sensitivity (Main-Thread blockt nicht mehr bei 1M Sims).

## Performance-Referenz

Lokal mit Node 22:

- TIPS-26.1 Classic: ~22 000 Sims/s
- TIPS-26.2 Advanced: ~22 000 Sims/s

Im Browser ist die Geschwindigkeit ähnlich (JIT vergleichbar). Bei 1 000 000 Sims dauert die Simulation ~45 s — sie läuft im Worker, die UI bleibt scrollbar.

## Algorithmus-Architektur

Alle Algorithmen sind **pure Funktionen** mit pluggable `Rng`-Parameter:

```ts
export function poissonRandom(lambda: number, rng: Rng = defaultRng): number;
```

- **Production**: `defaultRng = Math.random`
- **Tests**: `mulberry32(seed)` → 100 % reproduzierbar

Das Tournament-Modell ist in vier Schichten getrennt:

1. **normalize.ts** — Min-Max-Normalisierung [0, 1]
2. **tips26v1.ts / tips26v2.ts** — Stärke-Berechnung + Match-Tor-Modell
3. **knockout.ts** — Tie-Break via stärken-gewichteter Coin-Flip
4. **monteCarlo.ts** — Turnier-Lauf (Gruppen-Round-Robin + 32er-K.o.)
5. **sensitivity.ts** — 20 × 500 Perturbationen mit Quantilen
6. **edgeAnalysis.ts** — Markt-Edge (echt) + Match-Edge (markt-konsistent abgeleitet)

## Roadmap

Aus Spec §9, in der App noch nicht umgesetzt:

| Prio | Feature                         | Aufwand   |
| ---- | ------------------------------- | --------- |
| P0   | Backtesting (WMs 2014/18/22)    | Mittel    |
| P0   | Brier / Log-Loss / RPS-Metriken | Mittel    |
| P1   | Random Forest / XGBoost         | Hoch      |
| P1   | Player-Level Features (xG etc.) | Mittel    |
| P1   | Echte Match-Quoten via API      | Niedrig   |
| P1   | Live-Update während Turnier     | Hoch      |
| P2   | FIFA-konformes K.o.-Bracket     | Mittel    |
| P2   | Tipprunden / Auth               | Hoch      |
| P3   | Bayesian Hierarchical Model     | Hoch      |
