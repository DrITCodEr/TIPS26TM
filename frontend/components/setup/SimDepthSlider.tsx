"use client";

import {
  SIM_LEVELS,
  selectNumSimulations,
  useSimulationStore,
} from "@/lib/stores/simulationStore";
import { formatSimCount } from "@/lib/utils/format";
import { Card } from "@/components/ui/Card";

export function SimDepthSlider() {
  const idx = useSimulationStore((s) => s.numSimulationsIdx);
  const setIdx = useSimulationStore((s) => s.setNumSimulationsIdx);
  const N = selectNumSimulations({ numSimulationsIdx: idx });
  const display = formatSimCount(N);
  const fillPercent = (idx / (SIM_LEVELS.length - 1)) * 100;

  let warning: { tone: "info" | "warning"; html: string } | null = null;
  if (N >= 500_000) {
    const est = Math.round(N / 22_000);
    warning = {
      tone: "warning",
      html: `🐢 Achtung: bei ${display} dauert die Simulation ca. <strong>${est}–${est * 2} Sekunden</strong>. Sorge dafür, dass das Gerät nicht schläft.`,
    };
  } else if (N >= 100_000) {
    const est = Math.round(N / 22_000);
    warning = {
      tone: "warning",
      html: `⏱️ Hoher Wert: ca. <strong>${est} Sekunden</strong> Wartezeit.`,
    };
  } else if (N >= 20_000) {
    const est = Math.max(1, Math.round(N / 22_000));
    warning = {
      tone: "info",
      html: `Erwartete Wartezeit: ca. <strong>${est} Sekunden</strong>.`,
    };
  }

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[13px] font-bold">Anzahl Turniere</div>
          <div
            className="text-[10px] mt-0.5"
            style={{ color: "var(--text-tertiary)" }}
          >
            Mehr Sims = genauere Wahrscheinlichkeiten, aber längere Wartezeit
          </div>
        </div>
        <div
          className="px-3 py-1.5 rounded-xl text-[14px] font-extrabold tabular-nums"
          style={{ background: "var(--mint)", color: "var(--bg-deep)" }}
        >
          {display}
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={SIM_LEVELS.length - 1}
        step={1}
        value={idx}
        onChange={(e) => setIdx(Number(e.target.value))}
        className="tips-range w-full"
        style={{ "--val": `${fillPercent}%` } as React.CSSProperties}
      />
      <div
        className="flex justify-between mt-2 text-[10px] font-semibold"
        style={{ color: "var(--text-tertiary)" }}
      >
        <span>1 K</span>
        <span>10 K</span>
        <span>100 K</span>
        <span>1 Mio</span>
      </div>
      {warning && (
        <div
          className="mt-3 text-[11px] px-3 py-2 rounded-lg leading-relaxed"
          style={{
            background:
              warning.tone === "warning"
                ? "rgba(249, 115, 22, 0.12)"
                : "var(--bg-tertiary)",
            color:
              warning.tone === "warning"
                ? "var(--orange)"
                : "var(--text-secondary)",
            border:
              warning.tone === "warning"
                ? "1px solid rgba(249, 115, 22, 0.3)"
                : "1px solid var(--border-subtle)",
          }}
          dangerouslySetInnerHTML={{ __html: warning.html }}
        />
      )}
    </Card>
  );
}
