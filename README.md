# TIPS-26™ — WM 2026 Vorhersage-App

Probabilistische Vorhersage der FIFA WM 2026 mit Monte-Carlo-Simulation und
5 wählbaren Modell-Varianten (v1 Classic → v5 Bivariate), FIFA-konformem
K.o.-Bracket, Backtesting gegen WMs 2014/18/22, Player-Aggregates, Surprise-
und Tor-Streuung-Slidern, plus 🇩🇪 DFB-Cheat-Easter-Egg.

## Live-Web-App auf GitHub Pages

Sobald GitHub Pages aktiviert ist, läuft die App unter:

```
https://<owner>.github.io/TIPS26TM/
```

In dieser Web-Variante holt die App alle **Live-Ergebnisse direkt von der
ESPN-API** beim Öffnen + automatisch alle 2 Minuten — kein Server, kein
API-Token nötig (ESPN ist CORS-offen).

### Pages aktivieren (einmalig)

1. **Settings → Pages → Source:** auf `GitHub Actions` umstellen
2. **Settings → Actions → Workflow permissions:** `Read and write` aktivieren
3. Pushe einmal auf `main` (oder triggere `Deploy GitHub Pages` manuell) →
   der Workflow baut die App und deployed sie automatisch. Nach ~1 Min ist
   sie erreichbar.

## Lokal als Datei öffnen

`tips26-app.html` aus dem Repo herunterladen und per Doppelklick öffnen.
Alle Features außer Live-Ergebnissen funktionieren — Browser blockieren
externe Fetches von `file://` aus Sicherheitsgründen. Die App zeigt dann
einen Hinweis im Spiele-Tab.

## Architektur

| Pfad | Inhalt |
|---|---|
| `frontend/` | Next.js-App (5 Algorithmen, alle Tabs, Tests) |
| `singlefile/` | Vite-Build, der die `lib/`-Logik der Next.js-App in EINE HTML packt |
| `singlefile/src/espn.ts` | ESPN-Live-API-Client |
| `tips26-app.html` | Letzter Build, committed für Direct-Download |
| `wm2026-vorhersage.html` | Original-Prototyp (Vanilla-JS, Referenz) |

Single-File neu bauen:

```bash
cd singlefile
npm install
npm run build  # → dist/index.html + Kopie als tips26-app.html
```

Tests laufen lassen:

```bash
cd frontend
npm install
npm test  # 134 Tests
```
