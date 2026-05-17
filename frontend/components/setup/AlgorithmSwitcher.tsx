"use client";

import { useSimulationStore } from "@/lib/stores/simulationStore";
import type { AlgorithmVersion } from "@/lib/types/simulation";

const ALGO_INFO: Record<
  AlgorithmVersion,
  { title: string; tag: string; desc: string; details: string }
> = {
  v1: {
    title: "TIPS-26.1",
    tag: "Classic",
    desc: "9-Faktoren · additive Poisson",
    details:
      "Lineare gewichtete Aggregation der 9 Faktoren · additive Poisson-Tor-Formel <code>λ = 1.4 + Δ·3.5</code> · unabhängige Tore Heim/Auswärts.",
  },
  v2: {
    title: "TIPS-26.2",
    tag: "Advanced",
    desc: "Log-linear · Dixon-Coles · Markt",
    details:
      "Forschungs-basierte Verbesserungen (Maher 1982, Dixon-Coles 1997, Groll et al. 2019):<br/>" +
      "• Log-lineare Tor-Formel <code>λ = exp(c + Δ·s)</code> (immer positiv)<br/>" +
      "• Dixon-Coles τ-Korrektur für niedrige Ergebnisse (mehr 1:1)<br/>" +
      "• Markt-Konsens-Blend (70 % TIPS + 30 % Bookmaker-implizit)<br/>" +
      "• Composite-Score für ELO + FIFA + Markt (Multikollinearität)<br/>" +
      "• Nicht-linearer Boost für Top-Teams mit hoher Form",
  },
  v3: {
    title: "TIPS-26.3",
    tag: "Player",
    desc: "v2 + Player-Aggregates (xG, GK, UCL)",
    details:
      "Erweitert v2 um aggregierte Player-Level-Features (Stübinger et al. 2020):<br/>" +
      "• Top-11-Marktwert statt Gesamtkader<br/>" +
      "• Anteil Spieler in Top-5-Ligen<br/>" +
      "• Anzahl UCL-aktive Spieler<br/>" +
      "• Squad-xG / xGA über letzte 12 Monate<br/>" +
      "• GK Post-Shot xG Save %<br/>" +
      "Blending: 70 % v2 + 30 % Player-Composite. <strong>Daten sind Demo-Werte</strong> — echte fbref-/transfermarkt-Anbindung in Roadmap §9.2.",
  },
};

export function AlgorithmSwitcher() {
  const algorithm = useSimulationStore((s) => s.algorithm);
  const setAlgorithm = useSimulationStore((s) => s.setAlgorithm);

  const versions: AlgorithmVersion[] = ["v1", "v2", "v3"];

  return (
    <>
      <div className="grid grid-cols-3 gap-1.5">
        {versions.map((version) => {
          const info = ALGO_INFO[version];
          const active = algorithm === version;
          return (
            <button
              key={version}
              onClick={() => setAlgorithm(version)}
              className="rounded-2xl p-2.5 text-left transition-all"
              style={{
                background: active ? "var(--mint-soft)" : "var(--bg-secondary)",
                border: active
                  ? "1px solid var(--mint)"
                  : "1px solid var(--border-subtle)",
                boxShadow: active ? "0 0 12px var(--mint-glow)" : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-1 gap-1">
                <span
                  className="text-[12px] font-extrabold"
                  style={{ color: active ? "var(--mint)" : "var(--text-primary)" }}
                >
                  {info.title}
                </span>
                <span
                  className="text-[9px] font-bold px-1 py-0.5 rounded-full"
                  style={{
                    background: active ? "var(--mint)" : "var(--bg-tertiary)",
                    color: active ? "var(--bg-deep)" : "var(--text-tertiary)",
                  }}
                >
                  {info.tag}
                </span>
              </div>
              <div
                className="text-[9px] leading-tight"
                style={{ color: "var(--text-tertiary)" }}
              >
                {info.desc}
              </div>
            </button>
          );
        })}
      </div>
      <div
        className="rounded-2xl p-3 mt-2.5 text-[11px] leading-relaxed"
        style={{
          background: "var(--bg-secondary)",
          color: "var(--text-secondary)",
          border: "1px solid var(--border-subtle)",
        }}
        dangerouslySetInnerHTML={{ __html: ALGO_INFO[algorithm].details }}
      />
    </>
  );
}
