"use client";

import { useSimulationStore } from "@/lib/stores/simulationStore";

export function AlgorithmBadge() {
  const algorithm = useSimulationStore(
    (s) => s.simulationResult?.algorithm ?? s.algorithm,
  );
  const isV2 = algorithm === "v2";

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold tracking-tight border mb-3"
      style={{
        background: isV2 ? "var(--mint-soft)" : "var(--bg-secondary)",
        borderColor: isV2 ? "var(--mint)" : "var(--border-subtle)",
        color: isV2 ? "var(--mint)" : "var(--text-secondary)",
        boxShadow: isV2 ? "0 0 8px var(--mint-glow)" : undefined,
      }}
    >
      <span className="text-[13px] leading-none">{isV2 ? "⚡" : "🧮"}</span>
      <span>
        Berechnet mit{" "}
        <strong className="font-extrabold ml-0.5">
          TIPS-26.{isV2 ? "2 Advanced" : "1 Classic"}
        </strong>
      </span>
    </div>
  );
}
