# TIPS-26 Single-File-Build

Vite-Build, der die komplette App (alle 5 Algorithmen, FIFA-Bracket,
Backtesting, Player-Aggregates, 8 Tabs + Backtest-Tab) als **eine einzige
HTML-Datei** baut. Doppelklick öffnet die App — kein Server, kein Build, kein
npm.

## Bauen

```bash
cd singlefile
npm install
npm run build
# → dist/index.html  (~300 KB, alles inline)
```

Die fertige Datei wird zusätzlich nach `../tips26-app.html` kopiert (manuell
oder per Wrapper-Script), damit man sie direkt aus dem Repo-Root mitnehmen
kann.

## Warum kein Web Worker?

Bei `file://`-Origin haben Browser strikte Restriktionen für Module-Worker
mit Data-URLs (Chrome, Safari). Wir lassen den Monte-Carlo daher synchron
im Main-Thread laufen — der bestehende `await Promise.resolve()`-Loop hält
die UI bei bis zu 100 K Sims responsiv. Für 1 Mio Sims ist die Next.js-
Variante besser (echter Web Worker).

## Architektur

```
singlefile/
├── index.html               Vite-Root-Template
├── vite.config.ts           Plugin-React + vite-plugin-singlefile + Aliases
├── tsconfig.json            Mappt @lib/* → ../frontend/lib/*
├── src/
│   ├── main.tsx             ReactDOM.createRoot
│   ├── App.tsx              PhoneFrame + Tab-Routing (useState statt Router)
│   ├── store.ts             Zustand-Store (gleiche Form wie frontend/)
│   ├── runHooks.ts          useRunSimulation / useRunSensitivity (synchron)
│   ├── styles/app.css       Vanilla-CSS-Tokens (kein Tailwind)
│   └── components/          Setup-, Ranking-, Groups-, Matches-, Edge-,
│                            Sensitivity-, Germany-, Home-, Backtest-Tab
└── dist/index.html          Build-Output (ignored)
```

Die gesamte Algorithmen- und Daten-Schicht wird aus `../frontend/lib/`
re-importiert — keine Duplikation. Neue Features in der Next.js-App landen
beim nächsten `npm run build` automatisch auch hier.

## Was drin ist

- **5 Algorithmus-Varianten** v1 Classic / v2 Advanced / v3 Player /
  v4 Ensemble / v5 Bivariate
- **9 Tabs**: Home · Setup · Gruppen · Spiele · Ranking · Stabilität ·
  Edge · DFB · Backtest (über Home erreichbar)
- **48 Teams**, 72 Gruppenspiele, FIFA-konformes K.o.-Bracket
- **3 historische WMs** (2014/18/22) für Backtesting
- **6 Presets**, 9 Faktor-Slider, Sim-Tiefe 1K..1M
