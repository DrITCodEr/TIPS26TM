"use client";

import { useEffect, useRef } from "react";
import { useSimulationStore } from "@/lib/stores/simulationStore";
import { TEAMS } from "@/lib/data/teams";

export function LoadingOverlay() {
  const loading = useSimulationStore((s) => s.loading);
  const flagsRef = useRef<(HTMLSpanElement | null)[]>([]);

  // Flag-Rotation während aktiver Phase
  useEffect(() => {
    if (!loading.kind) return;
    const id = setInterval(() => {
      const allFlags = TEAMS.map((t) => t.flag);
      for (let i = 0; i < 5; i++) {
        const el = flagsRef.current[i];
        if (el) el.textContent = allFlags[Math.floor(Math.random() * allFlags.length)];
      }
    }, 220);
    return () => clearInterval(id);
  }, [loading.kind]);

  const active = loading.kind !== null;
  const progressPct = Math.min(100, loading.progress * 100);

  return (
    <div className={`loading-overlay ${active ? "active" : ""}`} aria-hidden={!active}>
      <div className="loading-stage">
        <div className="loading-pulse-ring" />
        <div className="loading-pulse-ring delay-1" />
        <div className="loading-pulse-ring delay-2" />
        <div className="loading-ball">⚽</div>
      </div>
      <div className="loading-flags">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            ref={(el) => {
              flagsRef.current[i] = el;
            }}
            className="loading-flag"
          >
            {["🇩🇪", "🇪🇸", "🇫🇷", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "🇧🇷"][i]}
          </span>
        ))}
      </div>
      <div className="loading-phase">{loading.phase || "Initialisierung ..."}</div>
      <div className="loading-counter">
        {loading.counterText || `${Math.round(progressPct)}%`}
      </div>
      <div className="loading-progress">
        <div
          className="loading-progress-fill"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="loading-tagline">
        Monte-Carlo · 9 Faktoren · Poisson-Modell
      </div>
    </div>
  );
}
