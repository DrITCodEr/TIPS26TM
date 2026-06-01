"use client";

import { useSimulationStore } from "@/lib/stores/simulationStore";

/**
 * 🇩🇪 EASTER EGG: „Deutschland gewinnt immer"-Toggle.
 *
 * Wenn aktiv, gewinnt das DFB-Team JEDES Spiel deterministisch mit 3:0
 * (Gruppenphase) bzw. zieht direkt in die nächste Runde ein (K.o.). Das
 * macht die Sim wissenschaftlich wertlos, aber unterhaltsam.
 *
 * Wirkt unabhängig vom gewählten Algorithmus und den anderen Slidern.
 */
export function DfbCheatToggle() {
  const active = useSimulationStore((s) => s.dfbAlwaysWins);
  const setActive = useSimulationStore((s) => s.setDfbAlwaysWins);

  return (
    <button
      onClick={() => setActive(!active)}
      className="w-full rounded-2xl p-4 text-left transition-all"
      style={{
        background: active
          ? "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(239,68,68,0.06))"
          : "var(--bg-card)",
        border: active
          ? "1px solid rgba(239,68,68,0.5)"
          : "1px solid var(--border-subtle)",
        boxShadow: active ? "0 0 16px rgba(239,68,68,0.25)" : undefined,
        cursor: "pointer",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[22px]">🇩🇪</span>
          <span
            className="text-[14px] font-extrabold"
            style={{ color: active ? "#fca5a5" : "var(--text-primary)" }}
          >
            Deutschland gewinnt immer
          </span>
        </div>
        <div
          className="w-12 h-7 rounded-full relative transition-all shrink-0"
          style={{
            background: active ? "var(--germany-red)" : "var(--bg-tertiary)",
          }}
        >
          <div
            className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all"
            style={{
              left: active ? 28 : 4,
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }}
          />
        </div>
      </div>
      <div
        className="text-[11px] leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {active ? (
          <>
            <strong style={{ color: "#fca5a5" }}>🏆 AKTIV.</strong> Jedes DFB-Spiel
            endet 3:0 für Deutschland, jede K.o.-Runde wird durchmarschiert.
            Mit Spanien, Frankreich & Co. wird im Halbfinale kurz reingeschaut —
            zum Frühstück gibts dann den Pokal.
          </>
        ) : (
          <>
            <strong>Easter-Egg.</strong> Nur für den Bierkasten-Spaß. Schaltet
            jede Statistik aus und macht Deutschland deterministisch zum
            Weltmeister. Wissenschaftlich wertlos, emotional wertvoll.
          </>
        )}
      </div>
    </button>
  );
}
