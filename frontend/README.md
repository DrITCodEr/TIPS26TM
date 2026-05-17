# TIPS-26 Frontend (MVP)

WM 2026 Vorhersage-App nach Spec §2.2 (Pure Frontend, Next.js + TypeScript).
Referenz-Prototyp liegt im Repo-Root unter `wm2026-vorhersage.html`.

## Stack

- **Next.js 15** (App Router, Turbopack)
- **React 19** + **TypeScript 5**
- **Tailwind 4** (CSS-Tokens via `@theme inline`)
- **Zustand** für State (Konfiguration + Ergebnisse + Loading)
- **Web Worker** für Monte-Carlo & Sensitivity (Main-Thread bleibt frei)
- **onnxruntime-web** (lazy-geladen) für XGBoost-Inferenz, sobald ein
  trainiertes Modell exportiert ist
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

Offline-Python: `python scripts/train_aggregator.py` trainiert das ML-Aggregator-
Modell und exportiert es als ONNX (siehe `scripts/README.md`).

## Struktur

```
app/                  Next.js App Router (9 Routen: 8 Tabs + /backtest)
components/layout/    PhoneFrame, StatusBar, AppHeader, BottomNav
components/loading/   LoadingOverlay
components/setup/     Algorithm-Switch (v1..v4), Presets, Slider, Run-Button
components/results/   Ranking, Groups, Matches, Edge, Sensitivity, Germany,
                      Home, Backtest
components/ui/        Card, Button, Slider, InfoBanner, AlgorithmBadge
lib/types/            TypeScript-Datenmodelle (team, match, factors,
                      simulation, odds, edge, player, backtest)
lib/data/             Teams (48), Schedule (72), Quoten, Presets, Faktoren,
                      Player-Aggregates, historische WMs (2014/18/22)
lib/algorithms/       v1, v2, v3, v4, MonteCarlo, Sensitivity, Edge, Metrics,
                      Backtest, mlAggregator (ONNX-Loader)
lib/workers/          simulation.worker.ts (off-thread für alle 4 Varianten)
lib/hooks/            useRunSimulation, useRunSensitivity
lib/stores/           Zustand-Store
tests/                Vitest-Suites (98 grün)
scripts/              train_aggregator.py (Python + XGBoost → ONNX)
public/               manifest.json, icon.svg, models/ (für aggregator.onnx)
```

## Implementierungs-Phasen

- **Phase 1 ✅** Skelett: 8 Stub-Routen, Phone-Frame, Bottom-Nav, Design-Tokens.
- **Phase 2 ✅** Algorithmen + Daten + 62 Vitest-Tests; Mulberry32 Determinismus.
- **Phase 3 ✅** UI tab-für-tab + Setup-Workflow + LoadingOverlay.
- **Phase 4 ✅** PWA-Manifest + App-Icon.
- **Phase 5 ✅** Web Worker für Monte-Carlo + Sensitivity.
- **Phase 6 ✅** Historisches Backtesting (WMs 2014/18/22 + Brier/Log-Loss/RPS +
  Reliability-Diagramm + `/backtest`-Tab).
- **Phase 7 ✅** TIPS-26.3 Player-Aggregates (Top-11-Markt, Top-5-Liga, UCL,
  Squad-xG/xGA, GK-PSxG) für alle 48 Teams.
- **Phase 8 ✅** TIPS-26.4 Ensemble-Stacker (v1 + v2 + v3 mit
  CV-kalibrierbaren Gewichten); ONNX-Schnittstelle steht; Python-Notebook für
  XGBoost-Training + Export bereit.

## Algorithmus-Varianten

| Version | Kernidee                                                          | Voraussetzung           |
| ------- | ----------------------------------------------------------------- | ----------------------- |
| **v1**  | Linear gewichtete 9 Faktoren · additive Poisson                   | nichts                  |
| **v2**  | + log-linear · Dixon-Coles · 70 / 30 Markt-Konsens-Blend          | + MARKT_QUOTEN          |
| **v3**  | + Player-Composite (Markt₁₁, Top-5-Liga, UCL, xG, xGA, GK-PSxG)   | + PLAYER_AGGREGATES     |
| **v4**  | Stacking: 0.15 v1 + 0.45 v2 + 0.40 v3 (CV-Default; ONNX folgt)    | + PLAYER_AGGREGATES     |

Alle Varianten teilen sich denselben Monte-Carlo-Loop. Der Unterschied liegt
ausschließlich in der Pre-Tournament-Stärke-Berechnung; das Match-Tor-Modell
ist v1 (additive Poisson) oder v2 (log-linear + Dixon-Coles).

## Performance-Referenz

Lokal mit Node 22:

- v1: ~22 000 Sims/s
- v2: ~22 000 Sims/s
- v3: ~22 000 Sims/s (+ einmaliger Composite-Compute)
- v4: ~22 000 Sims/s (3 Stärke-Berechnungen einmalig, danach identisch)

Im Browser ist die Geschwindigkeit ähnlich (V8-JIT vergleichbar). Bei
1 000 000 Sims dauert die Simulation ~45 s — sie läuft im Web Worker, die UI
bleibt scrollbar.

## Backtesting (Phase 6)

Auf `/backtest` validierst Du die Modelle gegen die echten K.o.-Phasen der
letzten drei WMs:

- Brier-Score (3-Outcome)
- Log-Loss
- Ranked Probability Score (RPS)
- Argmax-Accuracy
- Reliability-Diagramm
- Per-Match Forecast vs Actual

⚠️ Pre-Turnier-Snapshots sind Demo-Annäherungen aus öffentlich verfügbarem
Wissen, keine exakten Stichtags-Werte (Roadmap §9.3).

## ML-Aggregator (Phase 8)

Der ML-Aggregator wird über `scripts/train_aggregator.py` offline trainiert
(XGBoost, scikit-learn, ONNX-Export). Sobald das resultierende Modell unter
`public/models/aggregator.onnx` liegt, lädt der Browser-Aggregator
(`lib/algorithms/mlAggregator.ts`) es automatisch via `onnxruntime-web` und
nutzt es für Match-Outcome-Inferenz.

Bis dahin fällt TIPS-26.4 transparent auf den Ensemble-Stacker mit
literatur-typischen Default-Gewichten (0.15 v1, 0.45 v2, 0.40 v3) zurück.

## Roadmap (verbleibend)

Aus Spec §9, noch nicht umgesetzt:

| Prio | Feature                              | Aufwand   |
| ---- | ------------------------------------ | --------- |
| P1   | Echte Match-Quoten via The Odds API  | Niedrig   |
| P1   | Live-Update während Turnier          | Hoch      |
| P2   | FIFA-konformes K.o.-Bracket          | Mittel    |
| P2   | Bivariate Poisson (exakt)            | Niedrig   |
| P2   | Tipprunden + Auth                    | Hoch      |
| P3   | Bayesian Hierarchical (PyMC)         | Hoch      |
| —    | Echte historische Pre-Turnier-Daten  | Mittel    |
| —    | Echte fbref/transfermarkt-Spielerdaten | Mittel  |
