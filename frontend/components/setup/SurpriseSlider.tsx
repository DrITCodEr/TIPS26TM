"use client";

import type { CSSProperties } from "react";
import { useSimulationStore } from "@/lib/stores/simulationStore";
import { Card } from "@/components/ui/Card";

/**
 * Orthogonaler Slider 0..100 %, der pro Match eine Tagesform-Streuung auf
 * beide Stärken einrechnet. Skala: 100 % entspricht σ = 0.30 (±30 % pro Team
 * pro Match). Wirkt auf alle 5 Algorithmen.
 */
export function SurpriseSlider() {
  const value = useSimulationStore((s) => s.surprisePercent);
  const setValue = useSimulationStore((s) => s.setSurprisePercent);

  const fill = value;
  const sigmaPercent = ((value / 100) * 0.3 * 100).toFixed(0);

  let hint = "Deterministisch — keine Tagesform-Streuung.";
  if (value > 0 && value <= 20) hint = "Dezent — kleine Schwankungen, ähnliche Top-Favoriten.";
  else if (value <= 50) hint = "Spürbar — Außenseiter überraschen häufiger.";
  else if (value <= 80) hint = "Hoch — Top-Favoriten scheitern öfter in der K.o.-Phase.";
  else if (value > 80) hint = "Sehr hoch — fast jedes Turnier bringt einen unerwarteten Champion.";

  return (
    <Card>
      <div className="flex items-start justify-between mb-3 gap-3">
        <div>
          <div className="text-[13px] font-bold flex items-center gap-1.5">
            <span className="text-[15px]">🎲</span> Überraschungs-Faktor
          </div>
          <div
            className="text-[10px] mt-0.5"
            style={{ color: "var(--text-tertiary)" }}
          >
            Tagesform-Streuung pro Team pro Match
          </div>
        </div>
        <div
          className="px-2.5 py-1 rounded-xl text-[12px] font-extrabold tabular-nums shrink-0"
          style={{ background: "var(--mint)", color: "var(--bg-deep)" }}
        >
          {value}%
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="tips-range w-full"
        style={{ "--val": `${fill}%` } as CSSProperties}
      />
      <div
        className="flex justify-between mt-2 text-[10px] font-semibold"
        style={{ color: "var(--text-tertiary)" }}
      >
        <span>0 % (aus)</span>
        <span>50 %</span>
        <span>100 % (chaotisch)</span>
      </div>
      <div
        className="mt-3 text-[11px] leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {hint}{" "}
        <span style={{ color: "var(--text-tertiary)" }}>
          (Stärke-Faktor pro Match ±{sigmaPercent} %)
        </span>
      </div>
    </Card>
  );
}
