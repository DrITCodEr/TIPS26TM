"use client";

import type { CSSProperties } from "react";
import { useSimulationStore } from "@/lib/stores/simulationStore";
import { Card } from "@/components/ui/Card";

/**
 * Orthogonaler Tor-Streuungs-Slider 0..100 %. Wirkt auf alle 5 Algorithmen.
 * Skala: 100 % entspricht φ = 0.40 (Negativ-Binomial-Overdispersion).
 *
 * φ = 0  : reine Poisson (Var = λ) — aktuelle Default-Verteilung
 * φ ~ 0.1 : leicht überdispers, mehr 4:1 / 3:2-Spiele
 * φ ~ 0.2 : empirisch passend zu internationalen Matches
 * φ ~ 0.4 : stark überdispers — 5:0, 7:1 keine Außenseiter mehr
 */
export function OverdispersionSlider() {
  const value = useSimulationStore((s) => s.dispersionPercent);
  const setValue = useSimulationStore((s) => s.setDispersionPercent);

  const phi = ((value / 100) * 1.5).toFixed(2);
  let hint = "Reine Poisson — Tore eng um λ verteilt, kaum 5+ Tor-Spiele.";
  if (value > 0 && value <= 20) hint = "Leicht überdispers — etwas mehr 3:1, 4:1.";
  else if (value <= 40) hint = "Empirisch passend (φ≈0.5) — 4:1 / 5:1 kommen häufig vor.";
  else if (value <= 60) hint = "Spürbar — 5:0, 6:1, 4:3 keine Seltenheit.";
  else if (value <= 80) hint = "Hoch — gelegentlich 7:1 oder 6:0.";
  else hint = "Extrem — Torfestivals + 0:0-Defensiv-Festungen häufig nebeneinander.";

  return (
    <Card>
      <div className="flex items-start justify-between mb-3 gap-3">
        <div>
          <div className="text-[13px] font-bold flex items-center gap-1.5">
            <span className="text-[15px]">⚡</span> Tor-Streuung
          </div>
          <div
            className="text-[10px] mt-0.5"
            style={{ color: "var(--text-tertiary)" }}
          >
            Wie oft fallen ungewöhnlich viele Tore?
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
        style={{ "--val": `${value}%` } as CSSProperties}
      />
      <div
        className="flex justify-between mt-2 text-[10px] font-semibold"
        style={{ color: "var(--text-tertiary)" }}
      >
        <span>0 % (Poisson)</span>
        <span>50 %</span>
        <span>100 % (Burst)</span>
      </div>
      <div
        className="mt-3 text-[11px] leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {hint}{" "}
        <span style={{ color: "var(--text-tertiary)" }}>
          (Overdispersion φ = {phi})
        </span>
      </div>
    </Card>
  );
}
