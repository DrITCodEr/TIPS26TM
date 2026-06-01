import type { CSSProperties } from "react";
import {
  selectNumSimulations,
  SIM_LEVELS,
  useStore,
} from "@/store";
import { useRunSimulation } from "@/runHooks";
import { FAKTOREN } from "@lib/data/factors";
import { PRESET_LABELS, PRESETS, type PresetKey } from "@lib/data/presets";
import type { AlgorithmVersion } from "@lib/types/simulation";
import { Button, Card, InfoBanner, SectionTitle, formatSimCount } from "./ui";

const ALGO_INFO: Record<
  AlgorithmVersion,
  { title: string; tag: string; desc: string; details: string }
> = {
  v1: {
    title: "TIPS-26.1", tag: "Classic", desc: "9-Faktor linear · add. Poisson",
    details:
      "Lineare gewichtete Aggregation der 9 Faktoren · additive Poisson-Tor-Formel <code>λ = 1.4 + Δ·3.5</code>.",
  },
  v2: {
    title: "TIPS-26.2", tag: "Advanced", desc: "Log-linear · Dixon-Coles · Markt",
    details:
      "Forschungs-basiert (Maher 1982 / Dixon-Coles 1997 / Groll et al. 2019):<br/>" +
      "• Log-lineare Tor-Formel <code>λ = exp(c + Δ·s)</code><br/>" +
      "• Dixon-Coles τ-Korrektur (mehr 1:1)<br/>" +
      "• Markt-Konsens-Blend (70 % TIPS + 30 % Bookmaker)<br/>" +
      "• Composite-Score ELO+FIFA+Markt<br/>" +
      "• Nicht-linearer Boost für Top-Form-Teams",
  },
  v3: {
    title: "TIPS-26.3", tag: "Player", desc: "v2 + Player-Aggregates",
    details:
      "v2 + Player-Level-Features (Stübinger 2020):<br/>" +
      "• Top-11-Marktwert<br/>• %-Top-5-Ligen<br/>• UCL-Spieler<br/>" +
      "• Squad-xG / xGA<br/>• GK Post-Shot xG Save %<br/>" +
      "Blend 70 % v2 + 30 % Player-Composite. <strong>Demo-Daten.</strong>",
  },
  v4: {
    title: "TIPS-26.4", tag: "Ensemble", desc: "Stacking v1+v2+v3",
    details:
      "Ensemble-Stacking nach §9.13:<br/>" +
      "<code>final = 0.15·v1 + 0.45·v2 + 0.40·v3</code><br/>" +
      "ML-Aggregator-Schnittstelle (ONNX) liegt bereit für späteren XGBoost-Drop-in.",
  },
  v5: {
    title: "TIPS-26.5", tag: "Bivariate", desc: "v2-Stärken + Bivariate Poisson",
    details:
      "Exakte Bivariate Poisson (Karlis & Ntzoufras 2003) statt DC-Resampling:<br/>" +
      "<code>X_A = X_1 + X_3</code>, <code>X_B = X_2 + X_3</code>, λ_3 = 0.2<br/>" +
      "Marginal-Mittelwerte wie v2, positive Korrelation der Tore beider Teams. Mehr Diagonal-Remis (2:2, 3:3).",
  },
};

const PRESET_ORDER: PresetKey[] = ["default", "balanced", "elo", "market", "form", "experience"];

function AlgorithmSwitcher() {
  const algorithm = useStore((s) => s.algorithm);
  const setAlgorithm = useStore((s) => s.setAlgorithm);
  const versions: AlgorithmVersion[] = ["v1", "v2", "v3", "v4", "v5"];

  return (
    <>
      <div className="algo-grid">
        {versions.map((v) => {
          const info = ALGO_INFO[v];
          const active = algorithm === v;
          return (
            <button
              key={v}
              className={`algo-btn ${active ? "active" : ""}`}
              onClick={() => setAlgorithm(v)}
            >
              <div className="algo-btn-row">
                <span className="algo-btn-name">{info.title}</span>
                <span className="algo-btn-tag">{info.tag}</span>
              </div>
              <div className="algo-btn-desc">{info.desc}</div>
            </button>
          );
        })}
      </div>
      <div className="algo-info" dangerouslySetInnerHTML={{ __html: ALGO_INFO[algorithm].details }} />
    </>
  );
}

function Presets() {
  const activePreset = useStore((s) => s.activePreset);
  const applyPreset = useStore((s) => s.applyPreset);
  return (
    <div className="preset-row">
      {PRESET_ORDER.map((p) => (
        <Button key={p} active={activePreset === p} onClick={() => applyPreset(p)}>
          {PRESET_LABELS[p]}
        </Button>
      ))}
    </div>
  );
}

function FactorSliders() {
  const weights = useStore((s) => s.weights);
  const setWeight = useStore((s) => s.setWeight);
  return (
    <div className="sliders-wrap">
      {FAKTOREN.map((f) => {
        const pct = (weights[f.key] / f.max) * 100;
        return (
          <div className="slider-card" key={f.key}>
            <div className="slider-header">
              <div className="slider-label">
                <span className="slider-icon">{f.icon}</span>
                {f.label}
              </div>
              <div className="slider-value-pill">{weights[f.key]}%</div>
            </div>
            <input
              type="range"
              min={0}
              max={f.max}
              value={weights[f.key]}
              onChange={(e) => setWeight(f.key, Number(e.target.value))}
              className="tips-range"
              style={{ "--val": `${pct}%` } as CSSProperties}
            />
          </div>
        );
      })}
    </div>
  );
}

function SimDepthSlider() {
  const idx = useStore((s) => s.numSimulationsIdx);
  const setIdx = useStore((s) => s.setNumSimulationsIdx);
  const N = selectNumSimulations({ numSimulationsIdx: idx });
  const display = formatSimCount(N);
  const pct = (idx / (SIM_LEVELS.length - 1)) * 100;

  let warning: { tone: "warning" | "info"; text: string } | null = null;
  if (N >= 500_000) warning = { tone: "warning", text: `🐢 Bei ${display} dauert die Sim ca. ${Math.round(N / 22_000)}–${Math.round(N / 11_000)} s.` };
  else if (N >= 100_000) warning = { tone: "warning", text: `⏱️ Hoch: ca. ${Math.round(N / 22_000)} s Wartezeit.` };
  else if (N >= 20_000) warning = { tone: "info", text: `Erwartung: ca. ${Math.max(1, Math.round(N / 22_000))} s.` };

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Anzahl Turniere</div>
          <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>
            Mehr Sims = genauere Wahrscheinlichkeiten
          </div>
        </div>
        <div className="slider-value-pill" style={{ fontSize: 14, padding: "6px 12px" }}>{display}</div>
      </div>
      <input
        type="range"
        min={0}
        max={SIM_LEVELS.length - 1}
        value={idx}
        onChange={(e) => setIdx(Number(e.target.value))}
        className="tips-range"
        style={{ "--val": `${pct}%` } as CSSProperties}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)" }}>
        <span>1 K</span><span>10 K</span><span>100 K</span><span>1 Mio</span>
      </div>
      {warning && (
        <div
          style={{
            marginTop: 12, fontSize: 11, padding: "8px 12px", borderRadius: 8,
            background: warning.tone === "warning" ? "rgba(249,115,22,0.12)" : "var(--bg-tertiary)",
            color: warning.tone === "warning" ? "var(--orange)" : "var(--text-secondary)",
            border: warning.tone === "warning" ? "1px solid rgba(249,115,22,0.3)" : "1px solid var(--border-subtle)",
          }}
        >
          {warning.text}
        </div>
      )}
    </Card>
  );
}

function SurpriseSlider() {
  const value = useStore((s) => s.surprisePercent);
  const setValue = useStore((s) => s.setSurprisePercent);
  const sigmaPercent = ((value / 100) * 0.3 * 100).toFixed(0);
  let hint = "Deterministisch — keine Tagesform-Streuung.";
  if (value > 0 && value <= 20) hint = "Dezent — kleine Schwankungen, ähnliche Top-Favoriten.";
  else if (value <= 50) hint = "Spürbar — Außenseiter überraschen häufiger.";
  else if (value <= 80) hint = "Hoch — Top-Favoriten scheitern öfter in der K.o.-Phase.";
  else if (value > 80) hint = "Sehr hoch — fast jedes Turnier bringt einen unerwarteten Champion.";

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15 }}>🎲</span> Überraschungs-Faktor
          </div>
          <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>
            Tagesform-Streuung pro Team pro Match
          </div>
        </div>
        <div className="slider-value-pill" style={{ fontSize: 14, padding: "6px 12px" }}>{value}%</div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="tips-range"
        style={{ "--val": `${value}%` } as CSSProperties}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)" }}>
        <span>0 % (aus)</span><span>50 %</span><span>100 % (chaotisch)</span>
      </div>
      <div style={{ marginTop: 12, fontSize: 11, lineHeight: 1.5, color: "var(--text-secondary)" }}>
        {hint}{" "}
        <span style={{ color: "var(--text-tertiary)" }}>
          (Stärke-Faktor pro Match ±{sigmaPercent} %)
        </span>
      </div>
    </Card>
  );
}

function OverdispersionSlider() {
  const value = useStore((s) => s.dispersionPercent);
  const setValue = useStore((s) => s.setDispersionPercent);
  const phi = ((value / 100) * 0.4).toFixed(2);
  let hint = "Reine Poisson — Tore eng um λ verteilt.";
  if (value > 0 && value <= 20) hint = "Leicht überdispers — etwas mehr 3:1, 4:1.";
  else if (value <= 50) hint = "Empirisch passend — 4:1 / 5:1 kommen vor.";
  else if (value <= 80) hint = "Hoch — 5:0, 6:0, gelegentlich auch 7:1.";
  else if (value > 80) hint = "Stark — fast jedes Turnier hat ein Torfestival.";

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15 }}>⚡</span> Tor-Streuung
          </div>
          <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>
            Wie oft fallen ungewöhnlich viele Tore?
          </div>
        </div>
        <div className="slider-value-pill" style={{ fontSize: 14, padding: "6px 12px" }}>{value}%</div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="tips-range"
        style={{ "--val": `${value}%` } as CSSProperties}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)" }}>
        <span>0 % (Poisson)</span><span>50 %</span><span>100 % (Burst)</span>
      </div>
      <div style={{ marginTop: 12, fontSize: 11, lineHeight: 1.5, color: "var(--text-secondary)" }}>
        {hint}{" "}
        <span style={{ color: "var(--text-tertiary)" }}>
          (Overdispersion φ = {phi})
        </span>
      </div>
    </Card>
  );
}

function DfbCheatToggle() {
  const active = useStore((s) => s.dfbAlwaysWins);
  const setActive = useStore((s) => s.setDfbAlwaysWins);
  return (
    <button
      onClick={() => setActive(!active)}
      style={{
        width: "100%",
        padding: 16,
        textAlign: "left",
        borderRadius: 16,
        cursor: "pointer",
        background: active
          ? "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(239,68,68,0.06))"
          : "var(--bg-card)",
        border: active ? "1px solid rgba(239,68,68,0.5)" : "1px solid var(--border-subtle)",
        boxShadow: active ? "0 0 16px rgba(239,68,68,0.25)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>🇩🇪</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: active ? "#fca5a5" : "var(--text-primary)" }}>
            Deutschland gewinnt immer
          </span>
        </div>
        <div
          style={{
            width: 48, height: 28, borderRadius: 14, position: "relative", flexShrink: 0,
            background: active ? "var(--germany-red)" : "var(--bg-tertiary)",
            transition: "all 0.15s ease",
          }}
        >
          <div
            style={{
              position: "absolute", top: 4, width: 20, height: 20, borderRadius: 10,
              background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              left: active ? 24 : 4, transition: "left 0.15s ease",
            }}
          />
        </div>
      </div>
      <div style={{ fontSize: 11, lineHeight: 1.5, color: "var(--text-secondary)" }}>
        {active ? (
          <>
            <strong style={{ color: "#fca5a5" }}>🏆 AKTIV.</strong> Jedes DFB-Spiel endet 3:0 für Deutschland,
            jede K.o.-Runde wird durchmarschiert. Mit Spanien, Frankreich & Co. wird im Halbfinale kurz
            reingeschaut — zum Frühstück gibts dann den Pokal.
          </>
        ) : (
          <>
            <strong>Easter-Egg.</strong> Nur für den Bierkasten-Spaß. Schaltet jede Statistik aus und
            macht Deutschland deterministisch zum Weltmeister. Wissenschaftlich wertlos, emotional wertvoll.
          </>
        )}
      </div>
    </button>
  );
}

export function SetupTab({ onSimulationDone }: { onSimulationDone: () => void }) {
  const idx = useStore((s) => s.numSimulationsIdx);
  const loading = useStore((s) => s.loading.kind);
  const run = useRunSimulation(onSimulationDone);
  const N = selectNumSimulations({ numSimulationsIdx: idx });

  return (
    <section>
      <InfoBanner icon="⚙">
        <strong>9 Faktoren bestimmen die Vorhersage.</strong> Justiere die Slider, wähle einen Algorithmus, und starte die Simulation.
      </InfoBanner>

      <SectionTitle>🧮 Algorithmus</SectionTitle>
      <AlgorithmSwitcher />

      <SectionTitle>🎯 Voreinstellungen</SectionTitle>
      <Presets />

      <SectionTitle>🎚️ Gewichtungen</SectionTitle>
      <FactorSliders />

      <SectionTitle>🎲 Simulations-Tiefe</SectionTitle>
      <SimDepthSlider />

      <SectionTitle>🎰 Überraschungs-Faktor</SectionTitle>
      <SurpriseSlider />

      <SectionTitle>⚡ Tor-Streuung</SectionTitle>
      <OverdispersionSlider />

      <SectionTitle>🎉 Spaß-Modus</SectionTitle>
      <DfbCheatToggle />

      <div className="sim-controls">
        <Button variant="primary" full disabled={loading !== null} onClick={run}>
          {loading ? "⏳ Simuliere ..." : `🎲 Simulation starten · ${formatSimCount(N)}×`}
        </Button>
        <div className="sim-status">Bereit zum Simulieren</div>
      </div>
    </section>
  );
}
