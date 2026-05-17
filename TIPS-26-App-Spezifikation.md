# TIPS-26: WM 2026 Vorhersage-App

## Komplette Implementierungs-Spezifikation für Claude Code

> **Zweck dieses Dokuments:** Vollständige Blueprint einer produktionsreifen Web-App zur probabilistischen Vorhersage der FIFA WM 2026 in den USA, Kanada und Mexiko. Dieses Dokument soll als alleinige Quelle für eine Implementation in Claude Code dienen.
> 
> **Aktueller Stand:** Prototyp existiert als Single-HTML-File (`wm2026-vorhersage.html`). Diese Spec definiert die Migration zu einer modular gebauten App.

**Version:** 1.0 · **Stand:** Mai 2026 · **Sprache:** Deutsch (UI), English (Code)

-----

## Inhaltsverzeichnis

1. [Projekt-Vision](#1-projekt-vision)
1. [Architektur](#2-architektur)
1. [Tech-Stack](#3-tech-stack)
1. [Datenmodelle (TypeScript)](#4-datenmodelle)
1. [Algorithmen](#5-algorithmen)
1. [Features (Tab für Tab)](#6-features)
1. [UI/UX Design System](#7-uiux-design-system)
1. [Datenquellen](#8-datenquellen)
1. [Roadmap (nicht-umgesetzte Verbesserungen)](#9-roadmap)
1. [Test-Strategie](#10-test-strategie)
1. [Deployment](#11-deployment)
1. [Anhang: Daten-Sets](#12-anhang-daten-sets)

-----

## 1. Projekt-Vision

**TIPS-26** (*Thomas-Irawan Predictive Stochastics 2026*) ist eine mobile-first Web-App, die mittels **Monte-Carlo-Simulation** und einem **konfigurierbaren 9-Faktoren-Ensemble-Modell** probabilistische Vorhersagen für die FIFA Weltmeisterschaft 2026 liefert.

### Kernfunktionen

- **Zwei wissenschaftlich begründete Algorithmus-Varianten:**
  - TIPS-26.1 Classic (lineare gewichtete Aggregation, additive Poisson)
  - TIPS-26.2 Advanced (log-lineare Poisson, Dixon-Coles, Bookmaker-Blend, Composite-Score, nicht-lineare Interaktionen)
- **Interaktive Konfiguration** der Faktor-Gewichtungen über Slider (9 Faktoren)
- **6 Voreinstellungs-Presets** (Standard, ELO-fokussiert, Markt-Bias, Form, Erfahrung, Balanced)
- **Variable Simulations-Tiefe** (1.000 bis 1.000.000 Turniere, logarithmischer Slider)
- **Sieben Ergebnis-Ansichten:** Gruppen, Einzelspiele, Gesamtranking, Sensitivitätsanalyse, Value-Bet-Edge, DFB-Spezial, Setup
- **Vergleich mit Buchmacher-Konsens** (Value-Bet-Detection)
- **Sensitivitätsanalyse** (Robustheits-Check des Modells)
- **Native iOS/Android-App-Look** im Browser (Progressive Web App)

### Zielgruppen

- WM-Enthusiasten mit Interesse an datengetriebener Analyse
- Tipprunden-Teilnehmer
- Sportwetten-Analytiker (Value-Bet-Detection)
- Lehrende / Studierende der Sportstatistik

### Designprinzipien

- **Wissenschaftlich fundiert:** Modelle nach Maher (1982), Dixon-Coles (1997), Groll et al. (2019), Zeileis (2022)
- **Transparent:** Jede Gewichtung erklärbar, jeder Algorithmus dokumentiert
- **Robust:** Sensitivitätsanalyse zeigt, wie stabil die Vorhersagen sind
- **Mobile-First:** Optimiert für Smartphone-Nutzung (Phone-Frame auf Desktop)

-----

## 2. Architektur

### 2.1 Empfohlene Architektur (Production-Ready)

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Next.js / React + TypeScript)                    │
│  ├── PWA mit Service Worker                                 │
│  ├── Web Workers für Monte-Carlo (UI bleibt responsive)     │
│  └── Tailwind CSS / Stitches für Styling                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│  Backend API (FastAPI / Python oder Node.js / TypeScript)   │
│  ├── /api/simulate         — POST simulate tournament       │
│  ├── /api/sensitivity      — POST run sensitivity analysis  │
│  ├── /api/odds             — GET current bookmaker odds     │
│  ├── /api/teams            — GET team data                  │
│  └── /api/schedule         — GET match schedule             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Datenschicht                                               │
│  ├── PostgreSQL (Match-Historie, Team-Daten, User-Sessions) │
│  ├── Redis (Caching Odds-Updates, Simulation-Results)       │
│  └── External APIs:                                         │
│      • The Odds API (Bookmaker-Quoten)                      │
│      • FIFA Rankings (Scraping/manuell)                     │
│      • transfermarkt.de (Marktwerte, Scraping)              │
│      • eloratings.net (Scraping)                            │
└─────────────────────────────────────────────────────────────┘
```

**Begründung:**

- **Python-Backend** ist Pflicht für die Roadmap-Features (Random Forest, XGBoost, Bayesian-Modelle via `pymc` oder `stan`)
- **Web Workers** im Frontend verhindern UI-Freezes bei 100K+ Simulationen
- **Postgres** für persistente User-Konfigurationen und Tipprunden
- **Redis** für Caching teurer Berechnungen (eine 100K-Simulation kann gecached werden)

### 2.2 Vereinfachte Architektur (MVP)

Falls schneller Launch das Ziel ist, geht alles im Frontend:

```
┌─────────────────────────────────────────────────────────────┐
│  Pure Frontend (Next.js + TypeScript, alles client-side)    │
│  ├── Algorithmen laufen im Browser (Web Workers)            │
│  ├── Statische Daten in JSON-Files                          │
│  ├── Markt-Quoten manuell aktualisiert in Source            │
│  └── Hosted auf Vercel (kostenlos)                          │
└─────────────────────────────────────────────────────────────┘
```

**Wann diese Variante:** MVP, persönliches Projekt, Tipprunde im Familienkreis. **Nicht geeignet** für skalierbares Produkt mit Live-Odds-Updates oder ML-Roadmap-Features.

### 2.3 File-Struktur (Empfehlung für Production-Variante)

```
tips26-app/
├── frontend/                       # Next.js App
│   ├── app/                        # App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Setup-Tab
│   │   ├── groups/page.tsx
│   │   ├── matches/page.tsx
│   │   ├── ranking/page.tsx
│   │   ├── sensitivity/page.tsx
│   │   ├── edge/page.tsx
│   │   └── germany/page.tsx
│   ├── components/
│   │   ├── ui/                     # Atomare UI-Komponenten
│   │   │   ├── Slider.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── algorithm/
│   │   │   ├── AlgorithmSwitcher.tsx
│   │   │   └── AlgorithmBadge.tsx
│   │   ├── setup/
│   │   │   ├── FactorSliders.tsx
│   │   │   ├── Presets.tsx
│   │   │   └── SimDepthSlider.tsx
│   │   ├── results/
│   │   │   ├── GroupPredictions.tsx
│   │   │   ├── MatchList.tsx
│   │   │   ├── RankingList.tsx
│   │   │   ├── SensitivityChart.tsx
│   │   │   ├── EdgeAnalysis.tsx
│   │   │   └── GermanyProfile.tsx
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx
│   │   │   ├── AppHeader.tsx
│   │   │   └── PhoneFrame.tsx
│   │   └── loading/
│   │       └── SimulationLoadingOverlay.tsx
│   ├── lib/
│   │   ├── algorithms/
│   │   │   ├── tips26v1.ts         # Classic
│   │   │   ├── tips26v2.ts         # Advanced
│   │   │   ├── normalize.ts        # Min-Max
│   │   │   ├── poisson.ts          # Random + PMF
│   │   │   ├── monteCarlo.ts       # Tournament-Sim
│   │   │   ├── tournament.ts       # Gruppen + K.o.
│   │   │   ├── sensitivity.ts
│   │   │   └── edgeAnalysis.ts
│   │   ├── workers/
│   │   │   ├── simulation.worker.ts
│   │   │   └── sensitivity.worker.ts
│   │   ├── data/
│   │   │   ├── teams.ts            # 48 Teams
│   │   │   ├── schedule.ts         # 72 Gruppenphasen-Spiele
│   │   │   ├── koBracket.ts        # 1/16 → Finale Pfade
│   │   │   ├── marktQuoten.ts      # Bookmaker-Odds
│   │   │   └── presets.ts          # 6 Faktor-Voreinstellungen
│   │   ├── types/
│   │   │   ├── team.ts
│   │   │   ├── match.ts
│   │   │   ├── simulation.ts
│   │   │   └── factors.ts
│   │   ├── utils/
│   │   │   ├── format.ts
│   │   │   └── color.ts
│   │   └── api/
│   │       └── client.ts           # HTTP-Client zu Backend
│   ├── public/
│   │   ├── flags/                  # SVG-Flaggen
│   │   ├── icons/
│   │   └── manifest.json           # PWA Manifest
│   ├── tests/
│   │   ├── algorithms/
│   │   ├── components/
│   │   └── e2e/                    # Playwright
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.js
│
├── backend/                        # FastAPI Python
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── simulate.py
│   │   │   ├── sensitivity.py
│   │   │   ├── odds.py
│   │   │   └── teams.py
│   │   ├── models/
│   │   │   ├── classic.py          # TIPS-26.1
│   │   │   ├── advanced.py         # TIPS-26.2
│   │   │   ├── random_forest.py    # Roadmap
│   │   │   └── xgboost_model.py    # Roadmap
│   │   ├── data/
│   │   │   ├── teams.py
│   │   │   ├── schedule.py
│   │   │   └── odds_fetcher.py
│   │   ├── db/
│   │   │   ├── connection.py
│   │   │   └── models.py
│   │   └── utils/
│   ├── tests/
│   ├── pyproject.toml
│   └── Dockerfile
│
├── shared/                         # Typen geteilt zwischen FE/BE
│   └── types/
│       └── *.ts
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ALGORITHMS.md
│   ├── DATA_SOURCES.md
│   └── DEPLOYMENT.md
│
├── docker-compose.yml
└── README.md
```

-----

## 3. Tech-Stack

### Frontend

|Tool                        |Zweck             |Begründung                                    |
|----------------------------|------------------|----------------------------------------------|
|**Next.js 15** (App Router) |Framework         |SSR + ISR, gutes Routing, Vercel-Deploy       |
|**TypeScript 5.x**          |Sprache           |Type Safety für komplexe Datenmodelle         |
|**Tailwind CSS 3.x**        |Styling           |Schnell, mobile-first, kein CSS-in-JS-Overhead|
|**shadcn/ui**               |Component-Library |Headless, anpassbar, copy-paste statt npm     |
|**lucide-react**            |Icons             |Konsistent, treeshakable                      |
|**recharts**                |Charts            |Stabilitäts-Plots, Edge-Visualisierung        |
|**Zustand**                 |State Management  |Leichter als Redux, ausreichend für die App   |
|**react-hook-form + zod**   |Forms / Validation|Für User-Einstellungen                        |
|**Vitest + Testing Library**|Testing           |Schnell, modern                               |
|**Playwright**              |E2E Tests         |Cross-Browser-Tests                           |

### Backend (optional, für Production)

|Tool              |Zweck                    |
|------------------|-------------------------|
|**FastAPI**       |REST API                 |
|**Pydantic v2**   |Datenvalidierung         |
|**NumPy + SciPy** |Numerik                  |
|**scikit-learn**  |ML (Random Forest)       |
|**XGBoost**       |Gradient Boosting        |
|**PyMC**          |Bayesian Models (Roadmap)|
|**SQLAlchemy 2.x**|ORM                      |
|**Alembic**       |DB Migrations            |
|**PostgreSQL 16** |Database                 |
|**Redis 7**       |Cache                    |

### Infrastructure

|Service                    |Zweck                                     |
|---------------------------|------------------------------------------|
|**Vercel**                 |Frontend-Hosting (kostenlos im Hobby-Plan)|
|**Railway** oder **Render**|Backend + Postgres + Redis                |
|**GitHub Actions**         |CI/CD                                     |
|**Sentry**                 |Error-Monitoring                          |
|**PostHog**                |Privacy-friendly Analytics                |

-----

## 4. Datenmodelle

Alle Modelle in TypeScript. Bei Python-Backend identische Strukturen via Pydantic.

### 4.1 Team

```typescript
// lib/types/team.ts
export type GroupName =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export interface Team {
  name: string;             // "Deutschland"
  flag: string;             // "🇩🇪" oder Pfad zu SVG
  group: GroupName;
  // Faktoren (Roh-Werte, werden normalisiert)
  elo: number;              // 1500-2100 (typisch)
  fifa: number;             // FIFA-Weltrangliste-Punkte
  marktwert: number;        // in Mio. EUR (Gesamtkader, transfermarkt.de)
  form: number;             // 0-1, Punkte aus letzten 10 Spielen / 30
  heim: number;             // 0-1, Heimvorteil-Faktor (1.0 für USA/CAN/MEX, 0.85 für nahe Länder, 0 sonst)
  wmHF: number;             // Anzahl WM-Halbfinal-Teilnahmen (historisch)
  trainer: number;          // 0-1, Trainer-Erfahrung Score
  star: number;             // Marktwert des teuersten Spielers, in Mio. EUR
  hoehe: number;            // 0-1, Klima/Höhen-Anpassung
  // Markt-Daten
  marktOdds: number;        // Decimal Odds für Turniersieg (vom Buchmacher-Aggregat)
}
```

### 4.2 Match

```typescript
// lib/types/match.ts
export interface Match {
  id: number;               // 1-72 für Gruppe, 73-104 für K.o.
  phase: 'group' | 'r32' | 'r16' | 'qf' | 'sf' | '3rd' | 'final';
  group?: GroupName;        // nur bei Gruppenspielen
  spieltag?: 1 | 2 | 3;    // nur bei Gruppenspielen
  datum: string;            // "Sa, 14.06.2026"
  zeit: string;             // "22:00" (MESZ)
  zeitET?: string;          // "16:00 ET" (für Reference)
  stadion: string;
  stadt: string;
  land: 'USA' | 'CAN' | 'MEX';
  teamA: string;            // Name aus Team.name
  teamB: string;
  istDfb?: boolean;         // true wenn Deutschland beteiligt
}
```

### 4.3 Faktor-Definition & Gewichte

```typescript
// lib/types/factors.ts
export type FactorKey =
  | 'elo' | 'fifa' | 'markt' | 'form' | 'heim'
  | 'wmHF' | 'trainer' | 'star' | 'hoehe';

export interface FactorDefinition {
  key: FactorKey;
  label: string;            // "ELO-Rating"
  icon: string;             // Emoji oder Lucide-Name
  min: number;              // Slider min
  max: number;              // Slider max
  default: number;          // Default-Gewicht (für „Standard"-Preset)
  description: string;      // Tooltip-Text
}

export interface FactorWeights {
  elo: number;
  fifa: number;
  markt: number;
  form: number;
  heim: number;
  wmHF: number;
  trainer: number;
  star: number;
  hoehe: number;
}

export const FAKTOREN: FactorDefinition[] = [
  { key: 'elo',     label: 'ELO-Rating',       icon: '📈', min: 0, max: 50, default: 30, description: 'World Football ELO; berücksichtigt Spielqualität' },
  { key: 'fifa',    label: 'FIFA-Punkte',      icon: '🏅', min: 0, max: 30, default: 10, description: 'Offizielle FIFA-Weltrangliste' },
  { key: 'markt',   label: 'Marktwert',        icon: '💰', min: 0, max: 30, default: 15, description: 'transfermarkt.de Kaderwert' },
  { key: 'form',    label: 'Form',             icon: '🔥', min: 0, max: 30, default: 15, description: 'Punkte aus letzten 10 Spielen' },
  { key: 'heim',    label: 'Heimvorteil',      icon: '🏠', min: 0, max: 30, default: 7,  description: 'Gastgeber + geografische Nähe' },
  { key: 'wmHF',    label: 'WM-Erfahrung',     icon: '⭐', min: 0, max: 30, default: 5,  description: 'Anzahl WM-Halbfinale historisch' },
  { key: 'trainer', label: 'Trainer',          icon: '👔', min: 0, max: 30, default: 4,  description: 'Erfahrung des Bundestrainers' },
  { key: 'star',    label: 'Top-Star',         icon: '🌟', min: 0, max: 30, default: 9,  description: 'Marktwert des teuersten Spielers' },
  { key: 'hoehe',   label: 'Klima-Anpassung',  icon: '🌡️', min: 0, max: 30, default: 5,  description: 'Höhen-/Wetter-Erfahrung' },
];
```

### 4.4 Simulation Result

```typescript
// lib/types/simulation.ts
export type AlgorithmVersion = 'v1' | 'v2';

export interface TeamStats {
  titel: number;            // Anzahl Simulationen mit diesem Team als Weltmeister
  finale: number;           // Anzahl mit Finalteilnahme
  hf: number;               // Halbfinale erreicht
  vf: number;               // Viertelfinale erreicht
  achtel: number;           // Achtelfinale (1/8)
  r32: number;              // 1/16 (neu bei 48-Team-WM)
  gruppe: number;           // Anzahl mit Gruppensieg
}

export interface MatchStats {
  matchId: number;
  winA: number;             // Anzahl Sim mit Heimsieg
  draw: number;
  winB: number;
  goalsA: number;           // Summe Tore Team A über alle Sims
  goalsB: number;
  scores: Record<string, number>;  // "1-0": 234, "2-1": 189, ...
}

export interface GroupRankStats {
  teamIdx: number;
  groupName: GroupName;
  position: [number, number, number, number];  // [p1, p2, p3, p4] Counts
}

export interface SimulationResult {
  algorithm: AlgorithmVersion;
  numSimulations: number;
  timestamp: string;        // ISO
  weights: FactorWeights;
  staerken: number[];       // Stärke-Score pro Team (idx-aligned mit teams[])
  stats: TeamStats[];       // Pro Team
  matchStats: MatchStats[]; // Pro Match
  groupRankStats: GroupRankStats[];
}
```

### 4.5 Markt-Quoten

```typescript
// lib/types/odds.ts
export interface MarktQuoten {
  /** Map team name → decimal odds for tournament winner */
  [teamName: string]: number;
}

export interface OddsMeta {
  stand: string;            // "13. Mai 2026"
  quellen: string[];        // ["BetMGM", "DraftKings", "FanDuel", "Pinnacle"]
  margin: number;           // Berechneter Overround (z.B. 1.163)
}
```

### 4.6 Edge-Analyse

```typescript
// lib/types/edge.ts
export interface TitelEdge {
  teamIdx: number;
  teamName: string;
  flag: string;
  simP: number;             // Simulated probability % (0-100)
  marktP: number;           // Market implied probability % (vig-corrected)
  edge: number;             // simP - marktP (in percentage points)
  absEdge: number;          // |edge|
}

export interface MatchEdge {
  matchId: number;
  teamA: string;
  teamB: string;
  datum: string;
  simWinA: number;
  simDraw: number;
  simWinB: number;
  marketWinA: number;       // synthetic
  marketDraw: number;
  marketWinB: number;
  edgeWinA: number;
  edgeDraw: number;
  edgeWinB: number;
  maxAbsEdge: number;
}
```

-----

## 5. Algorithmen

### 5.1 Normalisierung (Min-Max)

Alle Faktoren werden auf den Bereich [0, 1] normalisiert, damit die Gewichte vergleichbar wirken:

```typescript
// lib/algorithms/normalize.ts
export function normalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  if (range === 0) return values.map(() => 0.5);
  return values.map(v => (v - min) / range);
}

export function normalizeFactor(teams: Team[], key: FactorKey): number[] {
  return normalize(teams.map(t => t[key]));
}
```

**Algorithmische Eigenschaft:**

- Stärkstes Team in einem Faktor bekommt 1.0, schwächstes 0.0
- Linear skaliert dazwischen
- Faktor-Unabhängigkeit (jeder wird separat normalisiert)
- **Schwäche:** Outlier verzerren (z.B. Spanien hat extrem hohen Marktwert → Rest gedrückt)

### 5.2 TIPS-26.1 Classic

#### 5.2.1 Stärke-Berechnung

```typescript
// lib/algorithms/tips26v1.ts

/**
 * TIPS-26.1 Classic: Lineare gewichtete Aggregation
 * Stärke S_i = Σ (w_k * x_ik) / Σ w_k
 */
export function calculateStrengths_v1(
  teams: Team[],
  weights: FactorWeights
): number[] {
  // Schritt 1: Normalisierung pro Faktor
  const normalized: Record<FactorKey, number[]> = {} as any;
  FAKTOREN.forEach(f => {
    normalized[f.key] = normalizeFactor(teams, f.key);
  });

  // Schritt 2: Gewichtete Summe
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 1;

  return teams.map((_, i) => {
    let score = 0;
    FAKTOREN.forEach(f => {
      score += normalized[f.key][i] * weights[f.key];
    });
    return score / totalWeight;
  });
}
```

#### 5.2.2 Match-Simulation (additive Poisson)

```typescript
/**
 * Tor-Erwartungswert (additive Formel):
 * λ_A = max(0.1, 1.4 + (S_A - S_B) * 3.5)
 *
 * Die 1.4 ist der durchschnittliche Tor-Erwartungswert pro Team pro Spiel
 * (empirisch bei internationalen Matches).
 * Der Faktor 3.5 ist eine Skalierung, die bei einem Stärke-Unterschied von 0.5
 * eine Differenz von 3.5 Toren produziert.
 *
 * SCHWÄCHE: λ kann theoretisch negativ werden, deshalb max(0.1, ...). Das ist
 * unphysikalisch und wurde in TIPS-26.2 durch log-linear ersetzt.
 */
export function simulateMatch_v1(sA: number, sB: number): MatchResult {
  const diff = sA - sB;
  const lambdaA = Math.max(0.1, 1.4 + diff * 3.5);
  const lambdaB = Math.max(0.1, 1.4 - diff * 3.5);
  return {
    toreA: poissonRandom(lambdaA),
    toreB: poissonRandom(lambdaB),
  };
}

export interface MatchResult {
  toreA: number;
  toreB: number;
}
```

#### 5.2.3 Poisson Random Sampling

```typescript
// lib/algorithms/poisson.ts

/**
 * Knuth-Algorithmus für Poisson-Sampling.
 * Funktioniert gut für λ < ~10.
 *
 * Algorithmus:
 *   L = exp(-λ); k = 0; p = 1
 *   loop: k++; p *= U(0,1); if p <= L: return k-1
 *
 * Cap auf k=12 als safety net (für extreme Werte).
 */
export function poissonRandom(lambda: number): number {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L && k < 12);
  return k - 1;
}

/**
 * Poisson Probability Mass Function für analytische Berechnungen
 * (z.B. synthetische Match-Quoten in Edge-Analyse)
 */
export function poissonPMF(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let factorial = 1;
  for (let i = 1; i <= k; i++) factorial *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
}
```

#### 5.2.4 K.o.-Spiel-Auflösung

```typescript
/**
 * K.o.-Spiel: bei Remis stärken-gewichteter Coin-Flip
 * (modelliert Verlängerung + Elfmeterschießen, wo die stärkere Mannschaft
 * leichten Vorteil hat, aber auch der Schwächere mit ~20-40% gewinnen kann)
 */
export function simulateKnockout(
  teamAIdx: number,
  teamBIdx: number,
  strengths: number[]
): number {
  const result = simulateMatch_v1(strengths[teamAIdx], strengths[teamBIdx]);
  if (result.toreA > result.toreB) return teamAIdx;
  if (result.toreB > result.toreA) return teamBIdx;
  // Remis → stärken-gewichteter Coin Flip
  const diff = strengths[teamAIdx] - strengths[teamBIdx];
  const probA = Math.min(0.85, Math.max(0.15, 0.5 + diff * 1.5));
  return Math.random() < probA ? teamAIdx : teamBIdx;
}
```

### 5.3 TIPS-26.2 Advanced

Die Advanced-Variante implementiert 5 wissenschaftlich begründete Verbesserungen aus aktuellen Papers:

|Verbesserung                     |Quelle                                        |Effekt                                      |
|---------------------------------|----------------------------------------------|--------------------------------------------|
|Log-lineare Tor-Formel           |Maher (1982), Dixon-Coles (1997)              |Smooth decay, immer positive λ              |
|Dixon-Coles τ-Korrektur          |Dixon & Coles (1997)                          |Realistische Verteilung niedriger Ergebnisse|
|Bookmaker-Consensus-Blend        |Leitner et al. (2010), Stübinger et al. (2020)|Markt-Information integriert                |
|Composite-Score                  |Groll et al. (2015), Lasso-Variable-Selection |Multikollinearitäts-Korrektur               |
|Nicht-linearer Interaktions-Boost|Schauberger & Groll (2018)                    |Top-Teams × Form                            |

#### 5.3.1 Composite-Score (Multikollinearitäts-Korrektur)

```typescript
// lib/algorithms/tips26v2.ts

/**
 * ELO, FIFA-Punkte und Marktwert korrelieren empirisch hoch (r > 0.85).
 * Statt drei separate Features mit jeweils ~25% Gewicht zu nutzen,
 * fassen wir sie zu einem "Composite Strength Score" zusammen — ähnlich wie
 * die erste Hauptkomponente in einer PCA.
 *
 * Gewichte: ELO 50%, FIFA 20%, Marktwert 30%
 * (basierend auf typischer Variance-Explanation in Lasso-Regressionen,
 * Groll et al. 2015)
 */
export function compositeScore(
  normalizedELO: number,
  normalizedFIFA: number,
  normalizedMarkt: number
): number {
  return 0.50 * normalizedELO + 0.20 * normalizedFIFA + 0.30 * normalizedMarkt;
}
```

#### 5.3.2 Stärke-Berechnung (v2)

```typescript
export function calculateStrengths_v2(
  teams: Team[],
  weights: FactorWeights,
  marktQuoten: MarktQuoten
): number[] {
  // Schritt 1: Normalisierung
  const normalized: Record<FactorKey, number[]> = {} as any;
  FAKTOREN.forEach(f => {
    normalized[f.key] = normalizeFactor(teams, f.key);
  });

  // Schritt 2: Composite-Score (Multikollinearitäts-Korrektur)
  const composite = teams.map((_, i) =>
    compositeScore(normalized.elo[i], normalized.fifa[i], normalized.markt[i])
  );

  // Schritt 3: Gewichte mappen (composite ersetzt die 3 einzelnen)
  const wComposite = weights.elo + weights.fifa + weights.markt;
  const wForm = weights.form;
  const wHeim = weights.heim;
  const wWmHF = weights.wmHF;
  const wTrainer = weights.trainer;
  const wStar = weights.star;
  const wHoehe = weights.hoehe;
  const totalW = wComposite + wForm + wHeim + wWmHF + wTrainer + wStar + wHoehe || 1;

  // Schritt 4: TIPS-Score mit nicht-linearer Interaktion
  const tipsScores = teams.map((t, i) => {
    let s =
      (composite[i] * wComposite +
        normalized.form[i] * wForm +
        normalized.heim[i] * wHeim +
        normalized.wmHF[i] * wWmHF +
        normalized.trainer[i] * wTrainer +
        normalized.star[i] * wStar +
        normalized.hoehe[i] * wHoehe) / totalW;

    // Nicht-linearer Boost: Top-Teams (composite>0.7) mit hoher Form (>0.7)
    // bekommen einen multiplikativen Vorteil — modelliert "Momentum"-Effekt
    if (composite[i] > 0.7 && normalized.form[i] > 0.7) {
      s += 0.05 * composite[i] * normalized.form[i];
    }
    return s;
  });

  // Schritt 5: Markt-Stärke aus Bookmaker-Quoten
  // Sqrt-Mapping verbessert Auflösung im unteren Bereich
  const marginSum = teams.reduce(
    (s, t) => s + 1 / (marktQuoten[t.name] || 9999), 0
  );
  const marktProbs = teams.map(t => (1 / (marktQuoten[t.name] || 9999)) / marginSum);
  const maxMarktProb = Math.max(...marktProbs);
  const marktStaerken = marktProbs.map(p => Math.sqrt(p / maxMarktProb));

  // Schritt 6: Ensemble-Blend 70% TIPS + 30% Markt (Stacking, Stübinger 2020)
  return teams.map((_, i) =>
    0.70 * tipsScores[i] + 0.30 * marktStaerken[i]
  );
}
```

#### 5.3.3 Log-lineare Tor-Formel + Dixon-Coles

```typescript
/**
 * Log-lineare Poisson-Tor-Formel nach Maher (1982) / Dixon-Coles (1997):
 *   log(λ) = c + (S_A - S_B) * scale
 *   λ = exp(c + diff * scale)
 *
 * Kalibrierung:
 *   c = ln(1.4) ≈ 0.336  (bei diff=0 entspricht das λ=1.4 wie in v1)
 *   scale = 0.9          (kalibriert für ähnliche Reaktion bei Standard-Diffs)
 *
 * Garantiert: λ > 0 immer (kein hartes Floor wie in v1)
 * Smooth decay bei großen Stärkedifferenzen
 *
 * Dixon-Coles τ-Korrektur (Approximation durch Resampling):
 *   ρ ≈ -0.13 verschiebt Wahrscheinlichkeit von (0,0), (1,0), (0,1) hin zu (1,1)
 *   Empirisch sind Unentschieden häufiger als reine Poisson vorhersagt.
 */
export function simulateMatch_v2(sA: number, sB: number): MatchResult {
  const diff = sA - sB;
  const lambdaA = Math.exp(0.336 + diff * 0.9);
  const lambdaB = Math.exp(0.336 - diff * 0.9);

  let toreA = poissonRandom(lambdaA);
  let toreB = poissonRandom(lambdaB);

  // Dixon-Coles-Approximation
  if (toreA === 0 && toreB === 0) {
    if (Math.random() < 0.10) { toreA = 1; toreB = 1; }
  } else if (toreA === 1 && toreB === 0) {
    if (Math.random() < 0.06) { toreA = 1; toreB = 1; }
  } else if (toreA === 0 && toreB === 1) {
    if (Math.random() < 0.06) { toreA = 1; toreB = 1; }
  }

  return { toreA, toreB };
}
```

**Mathematischer Hinweis:** Die exakte Dixon-Coles-Formulierung lautet:

```
P(X=x, Y=y) = τ(x, y, λ, μ, ρ) * P_Poisson(x | λ) * P_Poisson(y | μ)

mit τ(x, y, λ, μ, ρ) = {
  1 - λμρ      wenn (x=0, y=0)
  1 + λρ       wenn (x=0, y=1)
  1 + μρ       wenn (x=1, y=0)
  1 - ρ        wenn (x=1, y=1)
  1            sonst
}
```

Die Resampling-Approximation in `simulateMatch_v2` ist eine performance-optimierte Variante (~10x schneller als exakte Berechnung über die volle Joint-Distribution). Für die Roadmap (siehe Sektion 9.8) ist die exakte bivariate Poisson empfohlen.

#### 5.3.4 Algorithmus-Dispatcher

```typescript
// lib/algorithms/index.ts
export function calculateStrengths(
  algorithm: AlgorithmVersion,
  teams: Team[],
  weights: FactorWeights,
  marktQuoten?: MarktQuoten
): number[] {
  if (algorithm === 'v2') {
    if (!marktQuoten) throw new Error('marktQuoten required for v2');
    return calculateStrengths_v2(teams, weights, marktQuoten);
  }
  return calculateStrengths_v1(teams, weights);
}

export function simulateMatch(
  algorithm: AlgorithmVersion,
  sA: number,
  sB: number
): MatchResult {
  return algorithm === 'v2' ? simulateMatch_v2(sA, sB) : simulateMatch_v1(sA, sB);
}
```

### 5.4 Monte-Carlo-Turnier-Simulation

```typescript
// lib/algorithms/monteCarlo.ts

export async function runMonteCarloSimulation(
  config: {
    algorithm: AlgorithmVersion;
    weights: FactorWeights;
    numSimulations: number;
    teams: Team[];
    schedule: Match[];
    koBracket: KoBracket;
    marktQuoten?: MarktQuoten;
    onProgress?: (progress: number) => void;
  }
): Promise<SimulationResult> {
  const { algorithm, weights, numSimulations, teams, schedule, koBracket, marktQuoten, onProgress } = config;

  // Stärken einmalig berechnen
  const strengths = calculateStrengths(algorithm, teams, weights, marktQuoten);

  // Aggregat-Stats initialisieren
  const teamStats: TeamStats[] = teams.map(() => ({
    titel: 0, finale: 0, hf: 0, vf: 0, achtel: 0, r32: 0, gruppe: 0,
  }));
  const matchStats: MatchStats[] = schedule.map(m => ({
    matchId: m.id, winA: 0, draw: 0, winB: 0, goalsA: 0, goalsB: 0, scores: {},
  }));
  const groupRankStats: GroupRankStats[] = teams.map((t, i) => ({
    teamIdx: i, groupName: t.group, position: [0, 0, 0, 0],
  }));

  // Batch-Size für UI-Updates (~100 Updates über die gesamte Simulation)
  const BATCH = Math.max(50, Math.floor(numSimulations / 100));

  for (let batch = 0; batch < numSimulations / BATCH; batch++) {
    for (let sim = 0; sim < BATCH; sim++) {
      simulateOneTournament({
        algorithm, strengths, teams, schedule, koBracket,
        teamStats, matchStats, groupRankStats,
      });
    }
    if (onProgress) {
      const progress = ((batch + 1) * BATCH) / numSimulations;
      onProgress(progress);
    }
    // Yield to UI
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return {
    algorithm,
    numSimulations,
    timestamp: new Date().toISOString(),
    weights,
    staerken: strengths,
    stats: teamStats,
    matchStats,
    groupRankStats,
  };
}
```

#### 5.4.1 Eine einzelne Turnier-Simulation

```typescript
function simulateOneTournament(ctx: {
  algorithm: AlgorithmVersion;
  strengths: number[];
  teams: Team[];
  schedule: Match[];
  koBracket: KoBracket;
  teamStats: TeamStats[];
  matchStats: MatchStats[];
  groupRankStats: GroupRankStats[];
}): void {
  const { algorithm, strengths, teams, schedule, koBracket, teamStats, matchStats, groupRankStats } = ctx;

  // === GRUPPENPHASE ===
  // Sammle für jede Gruppe Punkte/Tore/Tordifferenz pro Team
  type TeamGroupRecord = { idx: number; punkte: number; tore: number; gegentore: number; td: number };
  const gruppen: Record<GroupName, TeamGroupRecord[]> = {} as any;
  teams.forEach((t, i) => {
    if (!gruppen[t.group]) gruppen[t.group] = [];
    gruppen[t.group].push({ idx: i, punkte: 0, tore: 0, gegentore: 0, td: 0 });
  });

  // Spiele alle Gruppen-Matches
  schedule.filter(m => m.phase === 'group').forEach((m, mIdx) => {
    const idxA = teams.findIndex(t => t.name === m.teamA);
    const idxB = teams.findIndex(t => t.name === m.teamB);
    const result = simulateMatch(algorithm, strengths[idxA], strengths[idxB]);

    // Match-Stats updaten
    const ms = matchStats[mIdx];
    ms.goalsA += result.toreA;
    ms.goalsB += result.toreB;
    if (result.toreA > result.toreB) ms.winA++;
    else if (result.toreA < result.toreB) ms.winB++;
    else ms.draw++;
    const scoreKey = `${result.toreA}-${result.toreB}`;
    ms.scores[scoreKey] = (ms.scores[scoreKey] || 0) + 1;

    // Punkte in Gruppe
    const recA = gruppen[teams[idxA].group].find(r => r.idx === idxA)!;
    const recB = gruppen[teams[idxA].group].find(r => r.idx === idxB)!;
    recA.tore += result.toreA; recA.gegentore += result.toreB;
    recB.tore += result.toreB; recB.gegentore += result.toreA;
    if (result.toreA > result.toreB) recA.punkte += 3;
    else if (result.toreB > result.toreA) recB.punkte += 3;
    else { recA.punkte += 1; recB.punkte += 1; }
  });

  // Gruppen-Rankings ermitteln (Tiebreaker: Punkte, Tordifferenz, Tore)
  const groupRankings: Record<GroupName, TeamGroupRecord[]> = {} as any;
  (Object.keys(gruppen) as GroupName[]).forEach(g => {
    const sorted = gruppen[g].map(r => ({ ...r, td: r.tore - r.gegentore }))
      .sort((a, b) =>
        b.punkte - a.punkte ||
        b.td - a.td ||
        b.tore - a.tore ||
        Math.random() - 0.5  // Final tiebreak: zufällig
      );
    groupRankings[g] = sorted;
    sorted.forEach((r, pos) => {
      groupRankStats[r.idx].position[pos]++;
      if (pos === 0) teamStats[r.idx].gruppe++;
    });
  });

  // === K.O.-PHASE ===
  // Bei WM 2026: 32 Teams in K.o. (Top 2 + 8 beste Dritte)
  // Bracket-Struktur ist deterministisch nach Gruppen-Platzierung

  const r32Teams = resolveR32Teams(groupRankings, koBracket);

  // 1/16
  const r16Teams: number[] = [];
  for (let i = 0; i < 16; i++) {
    const teamA = r32Teams[i * 2];
    const teamB = r32Teams[i * 2 + 1];
    teamStats[teamA].r32++; teamStats[teamB].r32++;
    const winner = simulateKnockout(teamA, teamB, strengths, algorithm);
    r16Teams.push(winner);
  }

  // Achtelfinale (1/8)
  const qfTeams: number[] = [];
  for (let i = 0; i < 8; i++) {
    teamStats[r16Teams[i * 2]].achtel++;
    teamStats[r16Teams[i * 2 + 1]].achtel++;
    qfTeams.push(simulateKnockout(r16Teams[i * 2], r16Teams[i * 2 + 1], strengths, algorithm));
  }

  // Viertelfinale
  const sfTeams: number[] = [];
  for (let i = 0; i < 4; i++) {
    teamStats[qfTeams[i * 2]].vf++;
    teamStats[qfTeams[i * 2 + 1]].vf++;
    sfTeams.push(simulateKnockout(qfTeams[i * 2], qfTeams[i * 2 + 1], strengths, algorithm));
  }

  // Halbfinale
  const finalTeams: number[] = [];
  for (let i = 0; i < 2; i++) {
    teamStats[sfTeams[i * 2]].hf++;
    teamStats[sfTeams[i * 2 + 1]].hf++;
    finalTeams.push(simulateKnockout(sfTeams[i * 2], sfTeams[i * 2 + 1], strengths, algorithm));
  }

  // Finale
  teamStats[finalTeams[0]].finale++;
  teamStats[finalTeams[1]].finale++;
  const champion = simulateKnockout(finalTeams[0], finalTeams[1], strengths, algorithm);
  teamStats[champion].titel++;
}
```

#### 5.4.2 Tie-Breaking & Beste Dritte

```typescript
/**
 * Bei der WM 2026 (48 Teams, 12 Gruppen) qualifizieren sich:
 * - Top 2 jeder Gruppe (24 Teams)
 * - Die 8 besten Drittplatzierten (8 Teams)
 *
 * Tiebreaker: Punkte → Tordifferenz → Tore → Fair Play → Lostrommel
 * Wir vereinfachen auf: Punkte → TD → Tore → Random
 */
function resolveR32Teams(
  groupRankings: Record<GroupName, TeamGroupRecord[]>,
  bracket: KoBracket
): number[] {
  // Sammele alle Dritten
  const thirds = (Object.keys(groupRankings) as GroupName[])
    .map(g => ({ group: g, ...groupRankings[g][2] }))
    .sort((a, b) =>
      b.punkte - a.punkte ||
      b.td - a.td ||
      b.tore - a.tore ||
      Math.random() - 0.5
    );

  const bestThirds = thirds.slice(0, 8);

  // Bracket-Mapping nach offizieller FIFA-Logik (vereinfacht)
  // Die exakte Mapping-Tabelle hängt davon ab, welche 8 Drittplatzierten qualifiziert sind.
  // Siehe Anhang 12.5 für die vollständige Bracket-Struktur.
  return bracket.computeR32Order(groupRankings, bestThirds);
}
```

### 5.5 Sensitivitätsanalyse

```typescript
// lib/algorithms/sensitivity.ts

/**
 * Sensitivitätsanalyse: Variiert alle 9 Gewichtungsfaktoren zufällig
 * und prüft, wie stark sich die Titel-Wahrscheinlichkeit ändert.
 *
 * Default: 20 Perturbationen mit jeweils 500 Sub-Simulationen
 * = 10.000 Simulations gesamt für ein robustes Bild
 */
export async function runSensitivityAnalysis(config: {
  baseWeights: FactorWeights;
  rangePercent: 15 | 30 | 50;  // ±15% / ±30% / ±50%
  numPerturbations: number;     // Default 20
  numSubSimulations: number;    // Default 500
  algorithm: AlgorithmVersion;
  teams: Team[];
  schedule: Match[];
  koBracket: KoBracket;
  marktQuoten?: MarktQuoten;
  onProgress?: (p: number) => void;
}): Promise<SensitivityResult> {
  const { baseWeights, rangePercent, numPerturbations, numSubSimulations, ...rest } = config;

  // Pro Team: Array der Titel-Wahrscheinlichkeiten über alle Perturbationen
  const titelDistribution: number[][] = config.teams.map(() => []);

  for (let p = 0; p < numPerturbations; p++) {
    // Perturbiere alle Gewichte um ±rangePercent
    const perturbedWeights = perturbWeights(baseWeights, rangePercent);

    // Mini-Simulation mit reduzierter Sim-Zahl
    const subResult = await runMonteCarloSimulation({
      ...rest,
      weights: perturbedWeights,
      numSimulations: numSubSimulations,
    });

    config.teams.forEach((_, i) => {
      const titelP = (subResult.stats[i].titel / numSubSimulations) * 100;
      titelDistribution[i].push(titelP);
    });

    if (config.onProgress) config.onProgress((p + 1) / numPerturbations);
  }

  // Statistiken pro Team berechnen
  const stats = config.teams.map((t, i) => {
    const dist = titelDistribution[i].sort((a, b) => a - b);
    return {
      teamName: t.name,
      median: dist[Math.floor(dist.length / 2)],
      q25: dist[Math.floor(dist.length / 4)],
      q75: dist[Math.floor(dist.length * 3 / 4)],
      min: dist[0],
      max: dist[dist.length - 1],
      cv: standardDeviation(dist) / mean(dist),  // Variationskoeffizient
    };
  });

  return { rangePercent, stats };
}

function perturbWeights(weights: FactorWeights, percent: number): FactorWeights {
  const factor = percent / 100;
  return Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [
      k, v * (1 + (Math.random() * 2 - 1) * factor)
    ])
  ) as FactorWeights;
}
```

### 5.6 Edge-Analyse (Value-Bet)

#### 5.6.1 Titel-Edge (echte Markt-Daten)

```typescript
// lib/algorithms/edgeAnalysis.ts

export function calculateTitelEdge(
  simulationResult: SimulationResult,
  teams: Team[],
  marktQuoten: MarktQuoten,
): TitelEdge[] {
  const totalMargin = teams.reduce(
    (sum, t) => sum + 1 / (marktQuoten[t.name] || 9999), 0
  );

  return teams.map((t, i) => {
    const simP = (simulationResult.stats[i].titel / simulationResult.numSimulations) * 100;
    const marktP = ((1 / (marktQuoten[t.name] || 9999)) / totalMargin) * 100;
    const edge = simP - marktP;
    return {
      teamIdx: i,
      teamName: t.name,
      flag: t.flag,
      simP,
      marktP,
      edge,
      absEdge: Math.abs(edge),
    };
  })
  .filter(t => t.simP > 0.05 || t.marktP > 0.5)
  .sort((a, b) => b.absEdge - a.absEdge);
}
```

#### 5.6.2 Synthetische Match-Quoten

```typescript
/**
 * Da Buchmacher die meisten Match-Quoten erst kurz vor dem Turnier öffnen,
 * leiten wir sie markt-konsistent aus den Outright-Quoten ab:
 *
 * 1. Aus Outright-Quoten → Markt-implizite Titel-Wahrscheinlichkeit pro Team
 * 2. Daraus → Markt-Stärke (Sqrt-Mapping)
 * 3. Markt-Stärken ins Poisson-Modell → λ_A, λ_B
 * 4. Analytisch P(toreA, toreB) für Grid [0..8] x [0..8]
 * 5. Aufsummieren zu Win/Draw/Loss
 */
export function syntheticMatchProbs(
  teamNameA: string,
  teamNameB: string,
  teams: Team[],
  marktQuoten: MarktQuoten,
): { winA: number; draw: number; winB: number } {
  const totalMargin = teams.reduce(
    (sum, t) => sum + 1 / (marktQuoten[t.name] || 9999), 0
  );
  const marktProbs = teams.map(t => (1 / (marktQuoten[t.name] || 9999)) / totalMargin);
  const maxP = Math.max(...marktProbs);

  const idxA = teams.findIndex(t => t.name === teamNameA);
  const idxB = teams.findIndex(t => t.name === teamNameB);
  const sA = Math.sqrt(marktProbs[idxA] / maxP);
  const sB = Math.sqrt(marktProbs[idxB] / maxP);

  const lambdaA = Math.max(0.1, 1.4 + (sA - sB) * 3.5);
  const lambdaB = Math.max(0.1, 1.4 + (sB - sA) * 3.5);

  let winA = 0, draw = 0, winB = 0;
  for (let i = 0; i <= 8; i++) {
    const pA = poissonPMF(lambdaA, i);
    for (let j = 0; j <= 8; j++) {
      const pB = poissonPMF(lambdaB, j);
      const p = pA * pB;
      if (i > j) winA += p;
      else if (i < j) winB += p;
      else draw += p;
    }
  }
  const total = winA + draw + winB;
  return {
    winA: (winA / total) * 100,
    draw: (draw / total) * 100,
    winB: (winB / total) * 100,
  };
}
```

-----

## 6. Features (Tab für Tab)

Die App hat eine **Bottom-Navigation mit 8 Tabs** (mobile-optimiert):

```
[ Home | Setup | Gruppen | Spiele | Ranking | Stabil. | Edge | DFB ]
```

### 6.1 Setup-Tab (Hauptkonfiguration)

**Inhalte (in Reihenfolge):**

1. **Algorithmus-Auswahl** (Section: 🧮 Algorithmus)
- Zwei große Schaltflächen: TIPS-26.1 Classic / TIPS-26.2 Advanced
- Aktive Schaltfläche: Mint-Glow + ✓-Marker
- Dynamische Info-Box darunter mit Details des gewählten Algorithmus
1. **Voreinstellungen** (Section: 🎯 Voreinstellungen)
- 6 Pill-Buttons: Standard / Balanced / ELO / Markt / Form / Erfahrung
- Setzt alle Slider auf vordefinierte Werte
- Definitionen siehe Abschnitt 12.4
1. **9 Faktor-Slider** (Section: ⚙️ Gewichtungen)
- Jeder Slider: 0 bis Max (je Faktor verschieden)
- Live-Anzeige des Werts in einer Pille
- Faktor-Label mit Icon
- Bei Slider-Drag: Live-Update der Stärke-Vorschau (optional, performancekritisch)
1. **Simulations-Tiefe** (Section: 🎲 Simulations-Tiefe)
- Logarithmischer 10-Stufen-Slider (1K → 1M)
- Live-Anzeige in Mint-Pille
- Performance-Warnungen bei hohen Werten
1. **Simulation starten** (Hauptbutton)
- Text-Dynamik: „🎲 Simulation starten · 5K×”
- Beim Klick: Loading-Overlay aktivieren, Web Worker starten

### 6.2 Gruppen-Tab

**Empty State:** Wenn noch keine Simulation gelaufen → Info-Banner „Noch keine Simulation gestartet”.

**Mit Daten:**

- Algorithm-Badge oben
- Pro Gruppe (A-L) eine Card:
  - Gruppen-Header: „Gruppe E”
  - 4 Teams, sortiert nach P(Platz 1)
  - Pro Team: Flag + Name + 4 horizontale Balken (Platz 1/2/3/4 in %)
  - Platz 1 in Mint hervorgehoben

### 6.3 Spiele-Tab

**Inhalte:**

- Filter-Chips oben: „Alle”, „🇩🇪 DFB”, „Top-Spiele”, „Spieltag 1/2/3”
- Liste aller 72 Gruppenphasen-Spiele, chronologisch
- Pro Match-Card:
  - Datum + Uhrzeit + Stadion
  - Teams mit Flaggen
  - Wahrscheinlichkeits-Balken (3 Segmente: Heim/Remis/Auswärts)
  - **Wahrscheinlichstes Ergebnis** (z.B. „2:1 · 12%”)
  - 3 Alternative Top-Ergebnisse (Pills)
  - „⌀ erwartete Tore: 1.7 : 1.1”
  - Bei DFB-Match: roter Akzent

### 6.4 Ranking-Tab

**Inhalte:**

- Algorithm-Badge
- **Top 4 Stat-Cards:**
  - 🥇 Top-Favorit (groß, mint)
  - 🥈 Platz 2
  - 🥉 Platz 3
  - 🇩🇪 Deutschland (rot, immer sichtbar)
- **Alle 48 Teams** als sortierte Liste:
  - Rang + Flag + Name
  - Hauptanzeige: P(Titel) in %
  - Sekundär: P(Finale), P(HF), P(VF)
  - Horizontaler Balken (Titel-Wahrscheinlichkeit relativ zur Top)
  - Top 3: gold/silber/bronze-getönt
- Footer: „Ergebnis aus N Turnier-Simulationen”

### 6.5 Stabilität-Tab (Sensitivitätsanalyse)

**Inhalte:**

- Info-Banner: „Wie stabil ist die Vorhersage?”
- **Variations-Stärke Selector:** ±15% / ±30% / ±50% (3 Buttons)
- **„Sensitivitätsanalyse starten”-Button**
- Nach Run:
  - Box-and-Whisker-Plot pro Top-10-Team
  - X-Achse: Titel-Wahrscheinlichkeit %
  - Y-Achse: Teams
  - Box: Q25-Q75, Median-Linie
  - Whiskers: Min-Max über alle Perturbationen
  - Schmale Box = robust, breite Box = sensitiv

### 6.6 Edge-Tab (Value-Bet-Analyse)

**Inhalte:**

- Algorithm-Badge
- **Sektion 1: Titel-Edge (echte Markt-Daten)**
  - Hinweis: Markt-Quoten Stand X, aggregiert aus Y Buchmachern
  - Top 20 Teams nach |Edge|, gefiltert nach SimP > 0.05% oder MarktP > 0.5%
  - Pro Team:
    - Flag + Name + Edge-Pille (Mint wenn positiv, Orange wenn negativ)
    - Zwei Balken untereinander: Markt (grau) / Sim (mint)
    - Prozentwerte rechts daneben
- **Sektion 2: Match-Edge (markt-konsistent abgeleitet)**
  - Disclaimer: Synthetische Quoten
  - Top 15 Spiele nach max(|Edge|)
  - Pro Match:
    - Header: Team A vs Team B + Datum
    - 3 Zeilen: 1 / X / 2 (Heim / Draw / Auswärts)
    - Pro Zeile: Markt-%, Sim-%, Edge-Pille

### 6.7 DFB-Tab (Deutschland-Spezial)

**Inhalte:**

- **Hero-Card:** „DFB-Team in Gruppe E”, Gruppenpartner als Meta
- **3 Gruppenspiele:** Dynamische Cards mit Vorhersagen
  - Curaçao 14.06., Elfenbeinküste 20.06., Ecuador 25.06.
  - Mit Top-3-Ergebnis-Predictions
- **K.o.-Wege:** Pfad nach Gruppensieg / Platz 2 / Platz 3
- **Stärken-Profil:** Welche Faktoren bringen DFB nach vorn / zurück?
- **Wahrscheinlichkeiten:** Titel, Finale, Halbfinale, …

### 6.8 Home-Tab (Übersicht & Methodik)

**Inhalte:**

- App-Übersicht (was tut TIPS-26)
- Methodik-Erklärung (4 Schritte, wissenschaftlicher Stil)
- Verweis auf Maher 1982 / Dixon-Coles 1997 / Groll et al. 2019
- Quick-Links zu allen Tabs

-----

## 7. UI/UX Design System

### 7.1 Farbpalette

Designsystem basiert auf den **DFB-Auswärtstrikot-Farben** der WM 2026 (Adidas, vorgestellt 27.03.2026 in Basel):

```typescript
// lib/design/colors.ts
export const colors = {
  // Basis (Marineblau-Töne)
  bgDeep:       '#0a1628',    // Hintergrund hauptsächlich
  bgPrimary:    '#0f1f3a',    // Cards
  bgSecondary:  '#142941',    // Sektionen
  bgTertiary:   '#1a3258',    // Hover/Active
  bgCard:       'rgba(20, 41, 65, 0.6)', // Glassmorphism

  // Akzent (Mintgrün / Aqua)
  mint:         '#5EEAD4',    // Hauptakzent (Active, Highlights)
  mintDark:     '#2DD4BF',
  mintSoft:     'rgba(94, 234, 212, 0.12)',
  mintGlow:     'rgba(94, 234, 212, 0.4)',

  // Text
  textPrimary:   '#f1f5f9',
  textSecondary: '#cbd5e1',
  textTertiary:  '#94a3b8',

  // Borders
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderMid:    'rgba(94, 234, 212, 0.2)',
  borderStrong: 'rgba(94, 234, 212, 0.4)',

  // Status
  germanyRed:   '#ef4444',
  orange:       '#f97316',
  gold:         '#fbbf24',
  silver:       '#94a3b8',
  bronze:       '#d97706',
} as const;
```

### 7.2 Typography

```typescript
export const fonts = {
  family: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
  sizes: {
    h1: '24px',
    h2: '18px',
    h3: '14px',
    body: '13px',
    small: '11px',
    micro: '9px',  // Bottom-Nav-Labels
  },
  weights: {
    regular: 500,
    medium: 600,
    bold: 700,
    extraBold: 800,
  },
  letterSpacing: '-0.02em',  // tight
};
```

### 7.3 Spacing & Radius

```typescript
export const spacing = {
  xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px', xxl: '32px',
};

export const radius = {
  sm: '8px', md: '12px', lg: '16px', xl: '20px', full: '999px',
};
```

### 7.4 Schlüssel-Komponenten

#### AlgorithmBadge

```tsx
// components/algorithm/AlgorithmBadge.tsx
export function AlgorithmBadge({ algorithm }: { algorithm: AlgorithmVersion }) {
  const isV2 = algorithm === 'v2';
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold tracking-tight border',
      isV2
        ? 'bg-mint-soft border-mint text-mint shadow-[0_0_8px_var(--mint-glow)]'
        : 'bg-bg-tertiary border-border-subtle text-text-secondary'
    )}>
      <span className="text-[13px] leading-none">{isV2 ? '⚡' : '🧮'}</span>
      <span>Berechnet mit <strong className="font-extrabold ml-0.5">
        TIPS-26.{isV2 ? '2 Advanced' : '1 Classic'}
      </strong></span>
    </div>
  );
}
```

#### Slider (mit Mint-Gradient-Fill)

```tsx
// components/ui/Slider.tsx
export function Slider({ value, min, max, onChange, label, icon }: SliderProps) {
  const fillPercent = ((value - min) / (max - min)) * 100;
  return (
    <div className="slider-wrapper">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[13px] font-bold flex items-center gap-1.5">
          {icon} {label}
        </span>
        <span className="px-2.5 py-1 rounded-xl bg-mint text-bg-deep text-[12px] font-extrabold tabular-nums">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ '--val': `${fillPercent}%` } as React.CSSProperties}
        className="custom-range"
      />
    </div>
  );
}
```

CSS für Custom Range:

```css
.custom-range {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(
    to right,
    var(--mint) var(--val),
    var(--bg-tertiary) var(--val)
  );
  outline: none;
}
.custom-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px; height: 20px;
  border-radius: 50%;
  background: var(--mint);
  box-shadow: 0 0 12px var(--mint-glow);
  cursor: pointer;
}
```

### 7.5 Phone-Frame auf Desktop

Auf großen Bildschirmen (>500px Breite) wird die App in einem Phone-Frame zentriert dargestellt:

```css
@media (min-width: 500px) {
  .app-container {
    width: 430px;
    height: 90vh;
    max-height: 920px;
    margin: 5vh auto;
    border-radius: 36px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5),
                0 0 0 12px #1a1a1a,
                0 0 0 14px #333;
    overflow: hidden;
    position: relative;
  }
  /* Status-Bar mit Live-Uhr oben */
  .status-bar {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    font-size: 14px;
    font-weight: 600;
  }
}
@media (max-width: 499px) {
  /* Mobile: Full-Screen */
  .app-container { width: 100vw; height: 100vh; border-radius: 0; }
}
```

### 7.6 Loading-Overlay

Während der Simulation ein vollflächiges Overlay mit:

- Rotierender Fußball-Emoji (Animation: 360° in 2s)
- Mint-Glow-Aura um den Ball
- 3 pulsierende konzentrische Ringe
- 5 wechselnde Länder-Flaggen unten (Wechsel alle 600ms)
- Aktueller Phasen-Text („Simuliere Gruppenphase…”, „K.o.-Phase…”)
- Live-Counter „1.234 / 5.000 Turniere”
- **Mindest-Laufzeit: 2,5 Sekunden** (auch bei schnellen Simulationen — UX-Reason)

-----

## 8. Datenquellen

### 8.1 Statische Daten (App-eingebaut)

|Datenset                           |Quelle                                  |Update-Frequenz                    |
|-----------------------------------|----------------------------------------|-----------------------------------|
|**Teams (48)**                     |FIFA, Wikipedia, transfermarkt.de       |Vor Turnierbeginn, dann selten     |
|**Spielplan (72 Gruppe + 31 K.o.)**|fifa.com/worldcup                       |Selten                             |
|**ELO-Werte**                      |eloratings.net (Scraping)               |Monatlich vor Turnier              |
|**FIFA-Punkte**                    |fifa.com/fifa-world-ranking             |Monatlich (FIFA-offizielle Updates)|
|**Marktwerte**                     |transfermarkt.de (Scraping)             |Vor Turnier (Kader-Nominierung)    |
|**Form**                           |Eigene Berechnung aus letzten 10 Spielen|Wöchentlich vor Turnier            |
|**Heimvorteil**                    |Manuell kodiert                         |Konstant pro Turnier               |
|**WM-Erfahrung**                   |Wikipedia, FIFA-Historie                |Konstant                           |

### 8.2 Markt-Quoten

**Outright (Turniersieger) für alle 48 Teams:**

|Quelle                                   |Verfügbarkeit                      |Format            |
|-----------------------------------------|-----------------------------------|------------------|
|**The Odds API**                         |API (kostenlos bis 500 calls/Monat)|JSON, Decimal Odds|
|**BetMGM, DraftKings, FanDuel, Pinnacle**|Web-Scraping                       |American Odds     |
|**oddschecker.com**                      |Aggregator-Site                    |Multi-Bookmaker   |

**Empfehlung:** The Odds API für strukturierten Zugriff, Fallback auf manuelle Updates.

**Stand der eingebauten Werte:** Mai 2026, aggregiert aus BetMGM, DraftKings, FanDuel, Pinnacle.

### 8.3 Update-Strategie

```typescript
// lib/data/oddsUpdater.ts
export async function updateOdds(): Promise<MarktQuoten> {
  if (process.env.NODE_ENV === 'production') {
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer_fifa_world_cup/odds?` +
      `apiKey=${process.env.ODDS_API_KEY}&` +
      `regions=us,uk&` +
      `markets=outrights&` +
      `oddsFormat=decimal`
    );
    return parseOddsResponse(await response.json());
  }
  return STATIC_MARKT_QUOTEN;  // Fallback
}
```

-----

## 9. Roadmap (Nicht-umgesetzte Verbesserungen)

Diese Features sind aus der wissenschaftlichen Recherche (siehe `FIFA_World_Cup_Prediction_Models.md`) als verbesserungswürdig identifiziert, aber im aktuellen Prototyp **nicht implementiert** — entweder weil sie ein Backend, externe Daten oder zusätzliche ML-Libraries erfordern.

### 9.1 [P1] Random Forest / XGBoost als Stärke-Aggregator

**Was:** Statt linearer Aggregation `S = Σ w_i x_i` → ein trainiertes Modell `S = f(x_1, ..., x_9)`.

**Warum:** Empirisch belegt (Schauberger & Groll 2018) — RFs schlagen GLMs auf WM-Daten und sind „close to or even outperforming bookmakers”. Modelliert nicht-lineare Interaktionen implizit.

**Wie:**

- Backend in Python mit `scikit-learn` oder `xgboost`
- Trainingsdaten: Match-Historie der letzten 5 WMs + Qualifyer (~2000 Matches)
- Target: Tordifferenz oder direkt P(win/draw/loss)
- API-Endpoint: `POST /api/strengths/ml`
- Modell-Versionierung über MLflow

**Aufwand:** Hoch (Daten-Sammlung, Training, Versionierung, Deployment). Mindestens 2 Wochen.

**Datenquellen für Training:**

- football-data.co.uk
- ATP Tour API equivalent für Fußball (nicht offiziell, Scraping)
- engsoccerdata (R-Paket) — historische Match-Daten

### 9.2 [P1] Player-Level-Features (xG, individuelle Marktwerte)

**Was:** Aggregierte Spieler-Statistiken statt nur Team-Werte:

- Top-11-Marktwert (statt Gesamtkader)
- Anteil Spieler in Top-5-Ligen
- Anzahl UCL-Spieler
- xG / xGA der Stürmer / Verteidiger über letzte 12 Monate
- Goalkeeper PSxG (Post-Shot xG Save %)

**Warum:** Stübinger et al. (2020) — Player-Level-Features signifikant prädiktiv über Team-Aggregate hinaus. Ist auch dezidiert in der scientific paper als wichtige Verbesserung gelistet.

**Wie:**

- Spieler-DB (transfermarkt.de + fbref.com Scraping)
- Vorgesehene Kader pro Team (28 Spieler)
- Aggregations-Layer berechnet Team-Features aus Spieler-Daten

**Aufwand:** Mittel-Hoch. ~1 Woche für Daten-Pipeline.

### 9.3 [P0] Historisches Backtesting

**Was:** Re-run der Modelle auf WMs 2014, 2018, 2022 und Metriken berechnen.

**Warum:** Ohne Backtesting kann die Modell-Qualität nicht beziffert werden (Wheatcroft 2019).

**Metriken:**

- **Brier Score** für 3-Outcome
- **Log-Loss**
- **Ranked Probability Score (RPS)**
- **Champion-Hit-Rate**
- **Halbfinalisten-Treffer** (X von 4)
- **Calibration-Plot** (Reliability-Diagramm)

**Wie:**

- Datenset: Match-Ergebnisse + Pre-Tournament-Team-Stats für 3 WMs
- Backtest-Runner: `npm run backtest -- --algo=v2 --wm=2022`
- Output: Markdown-Report mit allen Metriken
- Optional: UI-Tab „Validation” zeigt diese Reports

**Aufwand:** Mittel. ~1 Woche für Daten + Implementation.

### 9.4 [P1] Echte Match-Quoten via API (statt synthetische)

**Was:** Sobald Buchmacher die Match-Märkte öffnen (typischerweise 2-4 Wochen vor Turnier), echte 1X2-Odds pro Spiel aus API ziehen.

**Warum:** Synthetische Quoten aus Outright + Poisson sind Modell-konsistent, aber nicht echte Markt-Information. Echte Match-Quoten enthalten zusätzliche Info (Verletzungen, Wetter, Form-Updates).

**Wie:**

- The Odds API: `markets=h2h` statt `outrights`
- Daily-Update via Cron-Job
- Fallback auf synthetische Quoten wenn API fehlt

**Aufwand:** Niedrig. ~2 Tage.

### 9.5 [P2] Exponential-Decay-Gewichtung für historische Spiele

**Was:** Aus Match-Historie berechnete „dynamische Team-Stärke” statt statischer Form-Variable.

```python
weight(match) = exp(-xi * (today - match_date))
# xi typisch 0.001 - 0.005 pro Tag, via CV kalibriert
```

**Warum:** Ley, Van de Wiele & Van Eetvelde (2019); Dixon-Coles (1997). Empirisch überlegen gegenüber Hard-Cutoff-Forms.

**Wie:**

- Match-Historie über 8 Jahre (alle Internationals)
- Bivariate Poisson-Fit mit Time-Decay
- Resultat: Time-weighted Attack/Defense-Ratings pro Team
- Ersetzt den heuristischen „Form”-Faktor

**Aufwand:** Mittel-Hoch. ~5-7 Tage.

### 9.6 [P0] Probabilistische Evaluations-Metriken

**Was:** Backtesting (siehe 9.3) braucht diese Metriken — sie sollten aber auch als Live-Dashboard integriert sein, sobald das Turnier läuft.

**Live-Tracking während Turnier:**

- Pro Match: Vorhergesagt vs. tatsächlich
- Running-Brier-Score
- Reliability-Diagramm (live aktualisiert)

**UI:** Neuer Tab „Performance” zeigt:

- Liste aller bisherigen Spiele mit Forecasts
- Akkumulierte Metriken
- Vergleich „Mein Modell” vs. „Buchmacher”

**Aufwand:** Mittel. ~1 Woche.

### 9.7 [P3] Bayesian Hierarchical Model

**Was:** Vollständige Implementierung von Baio & Blangiardo (2010) mit Stan oder PyMC.

```python
# Pseudocode
import pymc as pm

with pm.Model() as model:
    home = pm.Normal('home', mu=0, sigma=1)
    att = pm.Normal('att', mu=0, sigma=tau_att, shape=n_teams)
    def_ = pm.Normal('def', mu=0, sigma=tau_def, shape=n_teams)
    theta_home = pm.math.exp(home + att[home_idx] - def_[away_idx])
    theta_away = pm.math.exp(att[away_idx] - def_[home_idx])
    y_home = pm.Poisson('y_home', mu=theta_home, observed=home_goals)
    y_away = pm.Poisson('y_away', mu=theta_away, observed=away_goals)
    trace = pm.sample(2000, tune=1000)
```

**Vorteil:** Quantifiziert Unsicherheit explizit (Posterior-Verteilungen).
**Nachteil:** Overshrinkage-Risk + lange MCMC-Laufzeiten + komplexe Implementierung.

**Aufwand:** Hoch. ~2 Wochen.

### 9.8 [P2] Bivariate Poisson (exakt statt Approximation)

**Was:** Statt der Resampling-Approximation in `simulateMatch_v2` → exakte Karlis-Ntzoufras-Implementation.

```typescript
function sampleBivariatePoisson(
  lambda1: number,  // unique to A
  lambda2: number,  // unique to B
  lambda3: number,  // shared (correlation)
): MatchResult {
  const x3 = poissonRandom(lambda3);
  return {
    toreA: poissonRandom(lambda1) + x3,
    toreB: poissonRandom(lambda2) + x3,
  };
}
```

mit `lambda3` aus Match-Historie geschätzt (~0.1-0.3 typisch).

**Aufwand:** Niedrig. ~2 Tage.

### 9.9 [P1] Live-Update während Turnier

**Was:** Während des laufenden Turniers Modell-Updates nach jedem Spieltag.

**Features:**

- **Bedingte Wahrscheinlichkeiten:** „Wenn DFB Curaçao schlägt, wie groß ist die Halbfinal-Chance?”
- **K.o.-Bracket-Predictor:** Aktuelle Bracket-Struktur mit Live-Probabilities
- **Tipp-Vergleich:** User-Tipps vs. Modell-Predictions

**Wie:**

- Tagsüber: Spiele werden geupdatet via Sport-API
- Nachts: Re-Simulation mit eingetretenen Ergebnissen als fixed
- Push-Notifications bei großen Verschiebungen (optional)

**Aufwand:** Hoch. ~2 Wochen für Live-Pipeline.

### 9.10 [P2] User-Authentication & Tipprunden

**Was:** Mehrere User können in einer Tipprunde teilnehmen, Vorhersagen abgeben, gegen das Modell antreten.

**Features:**

- Login (Email/Google/Apple)
- Tippen vor jedem Match (1X2 + Tor-Tipp)
- Punktesystem (Standard: 3 für genaues Ergebnis, 1 für 1X2 korrekt)
- Leaderboard pro Tipprunde
- „Bot-Teilnehmer”: TIPS-26.1 und TIPS-26.2 als Mitspieler

**Tech:**

- NextAuth.js für Auth
- Postgres für User-Daten + Tipps
- Daily-Cron-Job aktualisiert Tippstände

**Aufwand:** Hoch. ~2-3 Wochen.

### 9.11 [P3] Web Workers für Performance

**Was:** Monte-Carlo läuft in einem Web Worker statt im Main Thread.

**Warum:** Bei 1M Simulationen friert die UI sonst ein. Worker-Based-Approach hält UI responsive.

**Wie:**

```typescript
// lib/workers/simulation.worker.ts
self.addEventListener('message', (e) => {
  const { config } = e.data;
  const result = runMonteCarloSimulation({
    ...config,
    onProgress: (p) => self.postMessage({ type: 'progress', value: p }),
  });
  self.postMessage({ type: 'result', value: result });
});
```

**Aufwand:** Niedrig-Mittel. ~3 Tage.

### 9.12 [P2] PWA Offline-Funktionalität

**Was:** App funktioniert offline (Service Worker cached Algorithmen + Daten).

**Use Case:** Im Stadion ohne stabile Internetverbindung simulieren.

**Aufwand:** Niedrig. ~2 Tage mit `next-pwa`.

### 9.13 [P3] Ensemble Stacking (mehrere Modelle kombiniert)

**Was:** Final-Prediction = gewichtetes Ensemble aus:

- TIPS-26.1
- TIPS-26.2
- Random Forest (Roadmap 9.1)
- Bookmaker-Consensus
- (optional: Bayesian Hierarchical)

```typescript
const ensemble =
  w1 * predict_v1(match) +
  w2 * predict_v2(match) +
  w3 * predict_rf(match) +
  w4 * predict_bookmaker(match);
```

**Gewichte:** via Optimierung auf Backtest-Set (siehe 9.3).

**Aufwand:** Mittel. ~5 Tage (sobald 9.1 + 9.3 fertig).

-----

## Priorisierungs-Übersicht

|Priorität|Feature                      |Aufwand       |
|---------|-----------------------------|--------------|
|**P0**   |9.3 Historisches Backtesting |Mittel        |
|**P0**   |9.6 Probabilistische Metriken|Mittel        |
|**P1**   |9.1 Random Forest            |Hoch          |
|**P1**   |9.2 Player-Level Features    |Mittel-Hoch   |
|**P1**   |9.4 Echte Match-Quoten API   |Niedrig       |
|**P1**   |9.9 Live-Update Turnier      |Hoch          |
|**P2**   |9.5 Exponential Decay        |Mittel-Hoch   |
|**P2**   |9.8 Bivariate Poisson exakt  |Niedrig       |
|**P2**   |9.10 Tipprunden              |Hoch          |
|**P2**   |9.12 PWA Offline             |Niedrig       |
|**P3**   |9.7 Bayesian Hierarchical    |Hoch          |
|**P3**   |9.11 Web Workers             |Niedrig-Mittel|
|**P3**   |9.13 Ensemble Stacking       |Mittel        |

-----

## 10. Test-Strategie

### 10.1 Unit Tests (Vitest)

```typescript
// tests/algorithms/poisson.test.ts
import { describe, it, expect } from 'vitest';
import { poissonRandom, poissonPMF } from '@/lib/algorithms/poisson';

describe('poissonRandom', () => {
  it('returns 0 for non-positive lambda', () => {
    expect(poissonRandom(0)).toBe(0);
    expect(poissonRandom(-1)).toBe(0);
  });

  it('produces correct mean for lambda=2.5', () => {
    const N = 10000;
    const samples = Array.from({ length: N }, () => poissonRandom(2.5));
    const mean = samples.reduce((a, b) => a + b, 0) / N;
    expect(mean).toBeCloseTo(2.5, 0);  // ±0.5 tolerance
  });
});

describe('poissonPMF', () => {
  it('sums to ~1 over reasonable range', () => {
    const lambda = 1.4;
    let sum = 0;
    for (let k = 0; k <= 12; k++) sum += poissonPMF(lambda, k);
    expect(sum).toBeCloseTo(1.0, 2);
  });
});
```

### 10.2 Integration Tests

```typescript
// tests/integration/simulation.test.ts
describe('Full Tournament Simulation', () => {
  it('TIPS-26.1 with default weights produces realistic top-favorites', async () => {
    const result = await runMonteCarloSimulation({
      algorithm: 'v1',
      weights: PRESETS.default,
      numSimulations: 1000,
      teams: TEAMS,
      schedule: SCHEDULE,
      koBracket: KO_BRACKET,
    });

    const champProbs = result.stats.map((s, i) => ({
      team: TEAMS[i].name,
      p: s.titel / 1000,
    })).sort((a, b) => b.p - a.p);

    // Top 5 sollten in den Forschungs-Konsens-Top-Teams sein
    const top5 = champProbs.slice(0, 5).map(c => c.team);
    expect(top5).toEqual(
      expect.arrayContaining(['Spanien', 'Frankreich', 'England', 'Brasilien', 'Argentinien'])
    );
  });

  it('TIPS-26.2 produces flatter distribution (regression to market)', async () => {
    const v1 = await runMonteCarloSimulation({ algorithm: 'v1', /*...*/ });
    const v2 = await runMonteCarloSimulation({ algorithm: 'v2', /*...*/ });

    const topV1 = Math.max(...v1.stats.map(s => s.titel)) / v1.numSimulations;
    const topV2 = Math.max(...v2.stats.map(s => s.titel)) / v2.numSimulations;

    // v2 sollte konservativer sein (Markt zieht zur Mitte)
    expect(topV2).toBeLessThan(topV1);
  });
});
```

### 10.3 Statistical Validation

```typescript
// tests/statistical/calibration.test.ts
describe('Modell-Kalibrierung', () => {
  it('Poisson-Sampling hat Var ≈ Mean (Poisson-Eigenschaft)', () => {
    const lambda = 1.5;
    const N = 100000;
    const samples = Array.from({ length: N }, () => poissonRandom(lambda));
    const mean = samples.reduce((a, b) => a + b, 0) / N;
    const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / N;
    expect(variance / mean).toBeCloseTo(1.0, 1);  // ±10%
  });

  it('Dixon-Coles Approximation erhöht P(1,1)', () => {
    const N = 100000;
    let count11_v1 = 0, count11_v2 = 0;
    for (let i = 0; i < N; i++) {
      const v1 = simulateMatch_v1(0.5, 0.5);  // gleichstarke Teams
      const v2 = simulateMatch_v2(0.5, 0.5);
      if (v1.toreA === 1 && v1.toreB === 1) count11_v1++;
      if (v2.toreA === 1 && v2.toreB === 1) count11_v2++;
    }
    expect(count11_v2).toBeGreaterThan(count11_v1);  // v2 hat mehr 1:1
  });
});
```

### 10.4 Performance-Benchmarks

```typescript
// tests/performance/benchmark.test.ts
describe('Performance', () => {
  it('100K Simulationen unter 10 Sekunden auf Reference-Hardware', async () => {
    const start = Date.now();
    await runMonteCarloSimulation({
      algorithm: 'v1',
      weights: PRESETS.default,
      numSimulations: 100000,
      teams: TEAMS,
      schedule: SCHEDULE,
      koBracket: KO_BRACKET,
    });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });
});
```

### 10.5 E2E Tests (Playwright)

```typescript
// tests/e2e/setup-flow.spec.ts
test('User kann Algorithmus wechseln und Simulation starten', async ({ page }) => {
  await page.goto('/');

  // Wechsel zu v2
  await page.click('[data-algo="v2"]');
  await expect(page.locator('.algo-btn[data-algo="v2"]')).toHaveClass(/active/);

  // Starte Simulation
  await page.click('#runBtn');

  // Warte auf Loading-Overlay
  await expect(page.locator('#loadingOverlay')).toBeVisible();

  // Warte auf Abschluss
  await expect(page.locator('#loadingOverlay')).toBeHidden({ timeout: 30000 });

  // Wechsel zu Ranking
  await page.click('[data-page="ranking"]');

  // Algorithm-Badge sollte v2 zeigen
  await expect(page.locator('#algoBadge_ranking')).toContainText('TIPS-26.2 Advanced');
});
```

-----

## 11. Deployment

### 11.1 Frontend → Vercel

```bash
# In Repo-Root
cd frontend
vercel --prod
```

`vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url",
    "NEXT_PUBLIC_ODDS_API_KEY": "@odds_api_key"
  }
}
```

### 11.2 Backend → Railway

```yaml
# railway.toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "backend/Dockerfile"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/api/health"
restartPolicyType = "ON_FAILURE"
```

`backend/Dockerfile`:

```dockerfile
FROM python:3.12-slim
WORKDIR /app
RUN pip install poetry
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-dev
COPY app/ ./app/
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 11.3 Postgres + Redis → Railway Managed

In Railway UI: `+ New` → `Database` → `PostgreSQL` und `Redis`. Connection-Strings landen automatisch als Env-Vars im Backend-Service.

### 11.4 GitHub Actions CI

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd frontend && npm ci
      - run: cd frontend && npm run lint
      - run: cd frontend && npm run test
      - run: cd frontend && npm run build

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: cd backend && pip install poetry && poetry install
      - run: cd backend && poetry run pytest
      - run: cd backend && poetry run ruff check .

  e2e:
    needs: [frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd frontend && npm ci
      - run: cd frontend && npx playwright install
      - run: cd frontend && npm run test:e2e
```

-----

## 12. Anhang: Daten-Sets

### 12.1 Alle 48 Teams (Auszug, Vollständig in `lib/data/teams.ts`)

Format pro Team: alle Faktoren als Roh-Werte. Werte basieren auf:

- **ELO:** eloratings.net (Stand Mai 2026)
- **FIFA:** fifa.com Weltrangliste (Stand Mai 2026)
- **Marktwert:** transfermarkt.de (Stand Mai 2026, in Mio. EUR)
- **Form:** Punkte aus letzten 10 Spielen (0-30 → normalisiert auf 0-1)
- **Heim:** 1.0 für USA/CAN/MEX, 0.85 für CONCACAF, 0 sonst
- **WM HF:** Anzahl WM-Halbfinale historisch
- **Trainer:** Erfahrung-Score 0-1
- **Star:** Marktwert des teuersten Spielers (Mio. EUR)
- **Hoehe:** Klima/Höhen-Adaptionsindex 0-1
- **marktOdds:** Decimal Odds für Turniersieg

```typescript
// lib/data/teams.ts (gekürzt)
export const TEAMS: Team[] = [
  // GRUPPE A
  { name: "Mexiko",        flag: "🇲🇽", group: "A",
    elo: 1755, fifa: 1664, marktwert: 195, form: 0.62, heim: 1.0,
    wmHF: 0, trainer: 0.55, star: 32, hoehe: 0.85, marktOdds: 81 },
  { name: "Südafrika",     flag: "🇿🇦", group: "A",
    elo: 1577, fifa: 1497, marktwert: 50, form: 0.58, heim: 0,
    wmHF: 0, trainer: 0.40, star: 8, hoehe: 0.50, marktOdds: 1501 },
  { name: "Tunesien",      flag: "🇹🇳", group: "A", /* ... */, marktOdds: 501 },
  { name: "Saudi-Arabien", flag: "🇸🇦", group: "A", /* ... */, marktOdds: 1001 },

  // GRUPPE B
  { name: "Schweiz",       flag: "🇨🇭", group: "B", /* ... */, marktOdds: 101 },
  { name: "Kanada",        flag: "🇨🇦", group: "B",
    elo: 1690, fifa: 1572, marktwert: 110, form: 0.65, heim: 1.0,
    wmHF: 0, trainer: 0.50, star: 35, hoehe: 0.70, marktOdds: 151 },
  { name: "Bosnien",       flag: "🇧🇦", group: "B", /* ... */, marktOdds: 1001 },
  { name: "Tschechien",    flag: "🇨🇿", group: "B", /* ... */, marktOdds: 401 },

  // GRUPPE C
  { name: "Brasilien",     flag: "🇧🇷", group: "C",
    elo: 2025, fifa: 1837, marktwert: 1050, form: 0.78, heim: 0,
    wmHF: 11, trainer: 0.80, star: 200, hoehe: 0.75, marktOdds: 9.0 },
  { name: "Marokko",       flag: "🇲🇦", group: "C",
    elo: 1758, fifa: 1672, marktwert: 250, form: 0.72, heim: 0,
    wmHF: 1, trainer: 0.65, star: 50, hoehe: 0.55, marktOdds: 41 },
  { name: "Haiti",         flag: "🇭🇹", group: "C", /* ... */, marktOdds: 2001 },
  { name: "Schottland",    flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", /* ... */, marktOdds: 151 },

  // GRUPPE D
  { name: "USA",           flag: "🇺🇸", group: "D",
    elo: 1750, fifa: 1665, marktwert: 285, form: 0.65, heim: 1.0,
    wmHF: 1, trainer: 0.55, star: 95, hoehe: 0.70, marktOdds: 51 },
  { name: "Paraguay",      flag: "🇵🇾", group: "D", /* ... */, marktOdds: 501 },
  { name: "Türkei",        flag: "🇹🇷", group: "D", /* ... */, marktOdds: 101 },
  { name: "Australien",    flag: "🇦🇺", group: "D", /* ... */, marktOdds: 501 },

  // GRUPPE E
  { name: "Deutschland",   flag: "🇩🇪", group: "E",
    elo: 1925, fifa: 1730, marktwert: 880, form: 0.70, heim: 0,
    wmHF: 13, trainer: 0.75, star: 110, hoehe: 0.65, marktOdds: 15 },
  { name: "Curaçao",       flag: "🇨🇼", group: "E",
    elo: 1432, fifa: 1378, marktwert: 35, form: 0.50, heim: 0.85,
    wmHF: 0, trainer: 0.30, star: 6, hoehe: 0.45, marktOdds: 5001 },
  { name: "Elfenbeink.",   flag: "🇨🇮", group: "E",
    elo: 1672, fifa: 1610, marktwert: 175, form: 0.65, heim: 0,
    wmHF: 0, trainer: 0.50, star: 40, hoehe: 0.60, marktOdds: 251 },
  { name: "Ecuador",       flag: "🇪🇨", group: "E",
    elo: 1758, fifa: 1644, marktwert: 165, form: 0.68, heim: 0,
    wmHF: 0, trainer: 0.55, star: 45, hoehe: 0.85, marktOdds: 126 },

  // GRUPPE F
  { name: "Niederlande",   flag: "🇳🇱", group: "F",
    elo: 1985, fifa: 1758, marktwert: 720, form: 0.72, heim: 0,
    wmHF: 5, trainer: 0.70, star: 95, hoehe: 0.65, marktOdds: 21 },
  { name: "Japan",         flag: "🇯🇵", group: "F", /* ... */, marktOdds: 81 },
  { name: "Iran",          flag: "🇮🇷", group: "F", /* ... */, marktOdds: 301 },
  { name: "Neuseeland",    flag: "🇳🇿", group: "F", /* ... */, marktOdds: 1501 },

  // GRUPPE G
  { name: "Spanien",       flag: "🇪🇸", group: "G",
    elo: 2068, fifa: 1881, marktwert: 920, form: 0.85, heim: 0,
    wmHF: 1, trainer: 0.75, star: 180, hoehe: 0.65, marktOdds: 5.5 },
  { name: "Kap Verde",     flag: "🇨🇻", group: "G", /* ... */, marktOdds: 1501 },
  { name: "Belgien",       flag: "🇧🇪", group: "G", /* ... */, marktOdds: 31 },
  { name: "Ägypten",       flag: "🇪🇬", group: "G", /* ... */, marktOdds: 301 },

  // GRUPPE H
  { name: "Saudi-Arabien", flag: "🇸🇦", group: "H", /* ... */, marktOdds: 1001 },
  { name: "Uruguay",       flag: "🇺🇾", group: "H",
    elo: 1888, fifa: 1690, marktwert: 360, form: 0.70, heim: 0,
    wmHF: 4, trainer: 0.65, star: 75, hoehe: 0.65, marktOdds: 51 },
  { name: "Iran",          flag: "🇮🇷", group: "H", /* ... */, marktOdds: 301 },
  { name: "Neuseeland",    flag: "🇳🇿", group: "H", /* ... */, marktOdds: 1501 },

  // GRUPPE I
  { name: "Frankreich",    flag: "🇫🇷", group: "I",
    elo: 2055, fifa: 1854, marktwert: 1100, form: 0.80, heim: 0,
    wmHF: 7, trainer: 0.80, star: 180, hoehe: 0.65, marktOdds: 6.0 },
  { name: "Senegal",       flag: "🇸🇳", group: "I", /* ... */, marktOdds: 66 },
  { name: "Iraq",          flag: "🇮🇶", group: "I", /* ... */, marktOdds: 1501 },
  { name: "Norwegen",      flag: "🇳🇴", group: "I",
    elo: 1810, fifa: 1620, marktwert: 420, form: 0.72, heim: 0,
    wmHF: 0, trainer: 0.60, star: 200, hoehe: 0.55, marktOdds: 66 },

  // GRUPPE J
  { name: "Argentinien",   flag: "🇦🇷", group: "J",
    elo: 2055, fifa: 1885, marktwert: 605, form: 0.75, heim: 0,
    wmHF: 5, trainer: 0.75, star: 80, hoehe: 0.70, marktOdds: 10.0 },
  { name: "Algerien",      flag: "🇩🇿", group: "J", /* ... */, marktOdds: 401 },
  { name: "Austria",       flag: "🇦🇹", group: "J", /* ... */, marktOdds: 151 },
  { name: "Jordanien",     flag: "🇯🇴", group: "J", /* ... */, marktOdds: 2001 },

  // GRUPPE K
  { name: "Portugal",      flag: "🇵🇹", group: "K",
    elo: 2015, fifa: 1825, marktwert: 880, form: 0.75, heim: 0,
    wmHF: 2, trainer: 0.70, star: 130, hoehe: 0.65, marktOdds: 16 },
  { name: "DR Kongo",      flag: "🇨🇩", group: "K", /* ... */, marktOdds: 751 },
  { name: "England",       flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "K",
    elo: 2010, fifa: 1820, marktwert: 1500, form: 0.75, heim: 0,
    wmHF: 5, trainer: 0.65, star: 180, hoehe: 0.55, marktOdds: 7.5 },
  { name: "Kroatien",      flag: "🇭🇷", group: "K", /* ... */, marktOdds: 36 },

  // GRUPPE L
  { name: "Usbekistan",    flag: "🇺🇿", group: "L", /* ... */, marktOdds: 751 },
  { name: "Kolumbien",     flag: "🇨🇴", group: "L",
    elo: 1870, fifa: 1718, marktwert: 350, form: 0.70, heim: 0,
    wmHF: 0, trainer: 0.60, star: 80, hoehe: 0.65, marktOdds: 41 },
  { name: "Südkorea",      flag: "🇰🇷", group: "L", /* ... */, marktOdds: 301 },
  { name: "Ghana",         flag: "🇬🇭", group: "L", /* ... */, marktOdds: 501 },
];
```

**Vollständige Daten:** Siehe `wm2026-vorhersage.html` Zeilen ~1800-1850.

### 12.2 Spielplan (alle 72 Gruppenphasen-Spiele)

```typescript
// lib/data/schedule.ts
export const SCHEDULE: Match[] = [
  // SPIELTAG 1
  { id: 1, phase: 'group', group: 'A', spieltag: 1,
    datum: 'Do, 11.06.2026', zeit: '19:00', zeitET: '13:00 ET',
    stadion: 'Estadio Azteca', stadt: 'Mexiko-Stadt', land: 'MEX',
    teamA: 'Mexiko', teamB: 'Südafrika' },
  // ... 71 weitere Spiele
];
```

**Vollständig:** 72 Spiele über 14 Tage (11.06.–25.06.2026). Die Spielzeiten sind:

- Spielzeiten der WM 2026: Variabel je Stadion (Time Zones in USA/CAN/MEX)
- Konvertierung zu MESZ: Eastern Time = MESZ - 6h
- Stadion-Zuordnung: siehe `wm2026-vorhersage.html` Konstanten

### 12.3 K.o.-Bracket-Struktur

```typescript
// lib/data/koBracket.ts
/**
 * Bei 48 Teams qualifizieren sich:
 * - 24 Gruppensieger und -zweite (Top 2 jeder von 12 Gruppen)
 * - 8 beste Drittplatzierte
 *
 * Bracket-Mapping nach FIFA:
 * Die exakte Zuordnung der 8 besten Dritten zu Bracket-Slots hängt davon ab,
 * aus welchen Gruppen sie kommen. FIFA-Schema siehe:
 * https://digitalhub.fifa.com/m/2c66dec0e3cd5d44/original/Regulations-FIFA-World-Cup-2026.pdf
 *
 * Hier vereinfachtes Schema für Implementation:
 */

export interface KoBracket {
  computeR32Order(
    groupRankings: Record<GroupName, TeamGroupRecord[]>,
    bestThirds: BestThirdEntry[]
  ): number[];  // 32 Team-Indices in Bracket-Reihenfolge
}

// Beispiel-Implementation (vereinfacht; offizielles Schema ist komplexer)
export const KO_BRACKET: KoBracket = {
  computeR32Order(rankings, bestThirds) {
    // R32-Slots: [winnerA, 2C, winnerB, 3rdFromX, ...]
    // Detailliertes Mapping siehe FIFA-Regulations
    // ...
    return r32TeamIndices;
  },
};
```

**Wichtig:** Die Bracket-Bestimmung der besten Drittplatzierten ist **komplex** (FIFA-Mapping-Tabelle abhängig von qualifizierten Gruppen). Bei Implementation auf offizielles FIFA-Schema zurückgreifen.

### 12.4 Voreinstellungs-Presets

```typescript
// lib/data/presets.ts
export const PRESETS: Record<string, FactorWeights> = {
  default: {
    elo: 30, fifa: 10, markt: 15, form: 15, heim: 7,
    wmHF: 5, trainer: 4, star: 9, hoehe: 5
  },
  balanced: {
    elo: 12, fifa: 12, markt: 12, form: 12, heim: 11,
    wmHF: 11, trainer: 11, star: 11, hoehe: 8
  },
  elo: {
    elo: 50, fifa: 10, markt: 10, form: 10, heim: 5,
    wmHF: 5, trainer: 5, star: 5, hoehe: 0
  },
  market: {
    elo: 10, fifa: 5, markt: 30, form: 10, heim: 5,
    wmHF: 5, trainer: 5, star: 25, hoehe: 5
  },
  form: {
    elo: 15, fifa: 5, markt: 10, form: 30, heim: 5,
    wmHF: 5, trainer: 5, star: 5, hoehe: 0
  },
  experience: {
    elo: 15, fifa: 10, markt: 10, form: 10, heim: 5,
    wmHF: 20, trainer: 15, star: 5, hoehe: 0
  },
};

export const PRESET_LABELS: Record<string, string> = {
  default: '📊 Standard',
  balanced: '⚖️ Balanced',
  elo: '📈 ELO-fokus',
  market: '💰 Markt-Bias',
  form: '🔥 Form-Fokus',
  experience: '⭐ Erfahrung',
};
```

### 12.5 Markt-Quoten (aggregierter Buchmacher-Konsens)

```typescript
// lib/data/marktQuoten.ts
/**
 * Stand: 13. Mai 2026
 * Quellen: BetMGM, DraftKings, FanDuel, Pinnacle (Aggregat)
 *
 * Format: decimal odds (American → Decimal: positive +X = X/100 + 1)
 *
 * Margin/Overround beim Outright-Markt: ~16% (typisch für WM-Märkte)
 * Nach Vig-Korrektur summieren sich alle 48 implied probabilities auf 100%.
 */
export const MARKT_QUOTEN: MarktQuoten = {
  // Titelfavoriten
  "Spanien":        5.5,    // +450
  "Frankreich":     6.0,    // +500
  "England":        7.5,    // +650
  "Brasilien":      9.0,    // +800
  "Argentinien":   10.0,    // +900
  // Zweite Reihe
  "Deutschland":   15.0,    // +1400
  "Portugal":      16.0,    // +1500
  "Niederlande":   21.0,    // +2000
  "Belgien":       31.0,    // +3000
  "Kroatien":      36.0,    // +3500
  // Mittlere Schicht
  "Marokko":       41.0,    "Kolumbien":     41.0,
  "Uruguay":       51.0,    "USA":           51.0,
  "Norwegen":      66.0,    "Senegal":       66.0,
  "Mexiko":        81.0,    "Japan":         81.0,
  "Türkei":       101.0,    "Schweiz":      101.0,
  "Ecuador":      126.0,
  // Außenseiter
  "Österreich":   151.0,    "Kanada":       151.0,    "Schottland":   151.0,
  "Schweden":     201.0,    "Elfenbeink.":  251.0,
  "Südkorea":     301.0,    "Ägypten":      301.0,    "Iran":         301.0,
  "Tschechien":   401.0,    "Algerien":     401.0,
  "Tunesien":     501.0,    "Australien":   501.0,    "Paraguay":     501.0,    "Ghana":        501.0,
  "Panama":       751.0,    "Usbekistan":   751.0,    "DR Kongo":     751.0,
  "Bosnien":     1001.0,    "Saudi-Arabien":1001.0,
  "Kap Verde":   1501.0,    "Südafrika":   1501.0,    "Neuseeland":  1501.0,    "Irak":        1501.0,
  "Jordanien":   2001.0,    "Haiti":       2001.0,    "Katar":       2001.0,
  "Curaçao":     5001.0,
};

export const ODDS_META: OddsMeta = {
  stand: '13. Mai 2026',
  quellen: ['BetMGM', 'DraftKings', 'FanDuel', 'Pinnacle'],
  margin: 1.163,  // berechnet aus den Quoten
};
```

### 12.6 DFB-spezifische Daten

```typescript
// lib/data/germany.ts
export const GERMANY_GROUP_MATCHES = [
  {
    id: 33, phase: 'group', group: 'E', spieltag: 1,
    datum: 'So, 14.06.2026', zeit: '19:00', zeitET: '13:00 ET',
    stadion: 'NRG Stadium', stadt: 'Houston', land: 'USA',
    teamA: 'Deutschland', teamB: 'Curaçao', istDfb: true,
    tvSender: 'ARD',
  },
  {
    id: 49, phase: 'group', group: 'E', spieltag: 2,
    datum: 'Sa, 20.06.2026', zeit: '22:00',
    stadion: 'BMO Field', stadt: 'Toronto', land: 'CAN',
    teamA: 'Deutschland', teamB: 'Elfenbeink.', istDfb: true,
    tvSender: 'ZDF',
  },
  {
    id: 65, phase: 'group', group: 'E', spieltag: 3,
    datum: 'Do, 25.06.2026', zeit: '22:00',
    stadion: 'MetLife Stadium', stadt: 'NY/NJ', land: 'USA',
    teamA: 'Deutschland', teamB: 'Ecuador', istDfb: true,
    tvSender: 'ARD',
  },
];

export const GERMANY_KO_PATHS = {
  groupWinner: [
    { round: '1/16', date: 'Mo, 29.06.', stadt: 'Foxborough', stadion: 'Gillette' },
    { round: 'Achtelfinale', date: 'Sa, 04.07.', stadt: 'Philadelphia', stadion: 'Lincoln Financial' },
    { round: 'Viertelfinale', date: 'Do, 09.07.', stadt: 'Dallas', stadion: 'AT&T' },
    { round: 'Halbfinale', date: 'Di, 14.07.', stadt: 'Dallas', stadion: 'AT&T' },
    { round: 'Finale', date: 'So, 19.07. 21:00', stadt: 'NY/NJ', stadion: 'MetLife' },
  ],
  groupSecond: [
    // alternative Bracket-Pfade ...
  ],
};
```

-----

## Letzte Hinweise für die Implementierung mit Claude Code

1. **Start mit MVP-Variante** (Architektur 2.2): Pure Frontend reicht für die ersten Funktionalitäten.
1. **Algorithmen-Modul zuerst bauen** (`lib/algorithms/`) — diese sind komplett unabhängig vom UI und gut testbar.
1. **Statische Daten** (Teams, Spielplan, Markt-Quoten) als TypeScript-Konstanten — keine API initial nötig.
1. **UI-Komponenten in Storybook** entwickeln (optional, aber sehr empfehlenswert).
1. **Backtesting-Pipeline früh aufsetzen** (Roadmap 9.3), auch wenn nur als Skript — gibt sofortiges Feedback zur Modell-Qualität.
1. **Web Worker für Monte-Carlo** (Roadmap 9.11) wird bei >100K Sims notwendig. Initial OK ohne, später nachrüsten.

**Daten-Updates vor Turnierbeginn (vermutlich Anfang Juni 2026):**

- Endgültige Kader-Nominierungen → Marktwerte aktualisieren
- Letzte Freundschaftsspiele → Form-Werte aktualisieren
- Aktuelle Buchmacher-Quoten → MARKT_QUOTEN aktualisieren
- FIFA-Ranking Update Mai 2026

**Live-Updates während des Turniers (siehe Roadmap 9.9) — der Game-Changer:**

- Sobald Spieltag 1 vorbei ist, Re-Simulation mit eingetretenen Ergebnissen als fixed
- Bedingte Probabilities werden viel präziser
- App wird damit zu einem täglich konsultierten Tool

-----

## Quellenverzeichnis (für Modell-Begründungen)

- Maher, M. J. (1982). Modelling association football scores. *Statistica Neerlandica*, 36(3), 109-118.
- Dixon, M. J., & Coles, S. G. (1997). Modelling association football scores and inefficiencies in the football betting market. *Applied Statistics*, 46(2), 265-280.
- Karlis, D., & Ntzoufras, I. (2003). Analysis of sports data by using bivariate Poisson models. *The Statistician*, 52(3), 381-393.
- Leitner, C., Zeileis, A., & Hornik, K. (2010). Forecasting sports tournaments by ratings of (prob)abilities. *International Journal of Forecasting*, 26(3), 471-481.
- Groll, A., Schauberger, G., & Tutz, G. (2015). Prediction of major international soccer tournaments. *JQAS*, 11(2).
- Schauberger, G., & Groll, A. (2018). Predicting matches in international football tournaments with random forests. *Statistical Modelling*, 18(5-6).
- Groll, A., Ley, C., Schauberger, G., & Van Eetvelde, H. (2019). A hybrid random forest to predict soccer matches in international tournaments. *JQAS*, 15(4).
- Stübinger, J., Mangold, B., & Knoll, J. (2020). Machine Learning in Football Betting. *Applied Sciences*, 10(1), 46.
- Zeileis, A., Groll, A., et al. (2022). Machine learning of a 2022 FIFA World Cup multiverse. zeileis.org.

**Siehe auch:** `FIFA_World_Cup_Prediction_Models__Scientific_Analysis_and_Evaluation_of_the_TIPS-26_Framework.md` für ausführliche wissenschaftliche Analyse.

-----

**Ende der Spezifikation.**

Diese Datei ist als alleinige Quelle für eine Implementation in Claude Code gedacht. Für Fragen oder Klarstellungen → Issue im Repo öffnen.