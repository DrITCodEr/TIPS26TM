"use client";

import { useSimulationStore } from "@/lib/stores/simulationStore";

export function AlgorithmBadge() {
  const algorithm = useSimulationStore(
    (s) => s.simulationResult?.algorithm ?? s.algorithm,
  );
  const dfbCheat = useSimulationStore((s) => s.dfbAlwaysWins);

  const isAdvanced =
    algorithm === "v2" ||
    algorithm === "v3" ||
    algorithm === "v4" ||
    algorithm === "v5";
  const label =
    algorithm === "v5"
      ? "TIPS-26.5 Bivariate"
      : algorithm === "v4"
        ? "TIPS-26.4 Ensemble"
        : algorithm === "v3"
          ? "TIPS-26.3 Player"
          : algorithm === "v2"
            ? "TIPS-26.2 Advanced"
            : "TIPS-26.1 Classic";
  const icon =
    algorithm === "v5"
      ? "🎲"
      : algorithm === "v4"
        ? "🎯"
        : algorithm === "v3"
          ? "🧬"
          : algorithm === "v2"
            ? "⚡"
            : "🧮";

  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold tracking-tight border"
        style={{
          background: isAdvanced ? "var(--mint-soft)" : "var(--bg-secondary)",
          borderColor: isAdvanced ? "var(--mint)" : "var(--border-subtle)",
          color: isAdvanced ? "var(--mint)" : "var(--text-secondary)",
          boxShadow: isAdvanced ? "0 0 8px var(--mint-glow)" : undefined,
        }}
      >
        <span className="text-[13px] leading-none">{icon}</span>
        <span>
          Berechnet mit <strong className="font-extrabold ml-0.5">{label}</strong>
        </span>
      </div>
      {dfbCheat && (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold tracking-tight border"
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            borderColor: "rgba(239, 68, 68, 0.5)",
            color: "#fca5a5",
            boxShadow: "0 0 8px rgba(239, 68, 68, 0.3)",
          }}
        >
          <span>🇩🇪</span>
          <span>
            <strong className="font-extrabold">CHEAT-MODE</strong> aktiv
          </span>
        </div>
      )}
    </div>
  );
}
