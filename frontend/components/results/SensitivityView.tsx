"use client";

import { useMemo } from "react";
import { useSimulationStore } from "@/lib/stores/simulationStore";
import { useRunSensitivity } from "@/lib/hooks/useRunSimulation";
import { AlgorithmBadge } from "@/components/ui/AlgorithmBadge";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/Card";
import { InfoBanner } from "@/components/ui/InfoBanner";

export function SensitivityView() {
  const sensRange = useSimulationStore((s) => s.sensRangePercent);
  const setSensRange = useSimulationStore((s) => s.setSensRangePercent);
  const result = useSimulationStore((s) => s.sensitivityResult);
  const loading = useSimulationStore((s) => s.loading.kind);
  const runSens = useRunSensitivity();

  const sorted = useMemo(() => {
    if (!result) return [];
    return [...result.stats].sort((a, b) => b.median - a.median).slice(0, 16);
  }, [result]);

  const axisMax = useMemo(() => {
    if (sorted.length === 0) return 20;
    return Math.max(5, Math.ceil(sorted[0].max * 1.1));
  }, [sorted]);

  return (
    <>
      <AlgorithmBadge />
      <InfoBanner icon="📈">
        <strong>Wie stabil ist die Vorhersage?</strong> Die Analyse variiert
        alle 9 Gewichtungsfaktoren zufällig und prüft, ob das Ranking robust
        bleibt.
      </InfoBanner>

      <SectionTitle>⚙️ Variations-Stärke</SectionTitle>
      <div
        className="rounded-2xl p-3"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex gap-2 flex-wrap">
          {([15, 30, 50] as const).map((p) => (
            <Button
              key={p}
              active={sensRange === p}
              onClick={() => setSensRange(p)}
            >
              ±{p}% {p === 15 ? "sanft" : p === 30 ? "standard" : "stark"}
            </Button>
          ))}
        </div>
        <div
          className="text-[10px] mt-2"
          style={{ color: "var(--text-tertiary)" }}
        >
          Jeder Faktor wird zufällig um ±{sensRange}% des aktuellen Werts
          variiert.
        </div>
      </div>

      <div className="mt-4">
        <Button
          variant="primary"
          fullWidth
          disabled={loading !== null}
          onClick={runSens}
        >
          {loading === "sensitivity"
            ? "⏳ Analysiere ..."
            : "📊 Sensitivitätsanalyse starten · 20 × 500"}
        </Button>
        <div
          className="text-center text-[11px] mt-2 font-semibold"
          style={{ color: "var(--text-tertiary)" }}
        >
          ~10 Sekunden Laufzeit
        </div>
      </div>

      {result && (
        <>
          <SectionTitle>🎯 Stabilität der Top-Favoriten</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            {sorted.slice(0, 2).map((t, i) => (
              <div
                key={t.idx}
                className="rounded-xl p-3"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  className="text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {i === 0 ? "🥇 Top-Favorit" : "🥈 Platz 2"}
                </div>
                <div className="text-[13px] font-bold mt-1 truncate">
                  {t.flag} {t.name}
                </div>
                <div
                  className="text-[11px] font-extrabold mt-0.5"
                  style={{ color: "var(--mint)" }}
                >
                  {t.median.toFixed(1)}%
                </div>
                <div
                  className="text-[9px]"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {t.p25.toFixed(0)}–{t.p75.toFixed(0)}
                </div>
              </div>
            ))}
            {(() => {
              const dt = result.stats.find((t) => t.name === "Deutschland");
              const rang =
                [...result.stats]
                  .sort((a, b) => b.median - a.median)
                  .findIndex((t) => t.name === "Deutschland") + 1;
              if (!dt) return null;
              return (
                <div
                  className="rounded-xl p-3"
                  style={{
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                  }}
                >
                  <div
                    className="text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: "#fca5a5" }}
                  >
                    🇩🇪 DFB Rang {rang}
                  </div>
                  <div className="text-[13px] font-bold mt-1">
                    {dt.median.toFixed(1)}%
                  </div>
                  <div
                    className="text-[9px]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {dt.p25.toFixed(1)} – {dt.p75.toFixed(1)}%
                  </div>
                </div>
              );
            })()}
          </div>

          <SectionTitle>📊 Titelchance ± Streuung</SectionTitle>
          <div
            className="flex justify-between text-[9px] font-bold mb-2 px-1"
            style={{ color: "var(--text-tertiary)" }}
          >
            <span>0%</span>
            <span>{(axisMax / 2).toFixed(0)}%</span>
            <span>{axisMax.toFixed(0)}%</span>
          </div>

          <div className="space-y-1.5">
            {sorted.map((t) => {
              const toPct = (v: number) => Math.min(100, (v / axisMax) * 100);
              const minP = toPct(t.min);
              const maxP = toPct(t.max);
              const p25P = toPct(t.p25);
              const p75P = toPct(t.p75);
              const medP = toPct(t.median);
              const iqrHalf = (t.p75 - t.p25) / 2;
              const isGermany = t.name === "Deutschland";

              return (
                <div
                  key={t.idx}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-lg"
                  style={{
                    background: isGermany
                      ? "rgba(239, 68, 68, 0.08)"
                      : "var(--bg-card)",
                    border: isGermany
                      ? "1px solid rgba(239, 68, 68, 0.3)"
                      : "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="flex items-center gap-1 w-24 shrink-0">
                    <span className="text-[14px]">{t.flag}</span>
                    <span
                      className="text-[10px] font-bold truncate"
                      style={{
                        color: isGermany ? "#fca5a5" : "var(--text-primary)",
                      }}
                    >
                      {t.name}
                    </span>
                  </div>
                  <div className="relative flex-1 h-5">
                    <div
                      className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
                      style={{ background: "var(--bg-tertiary)" }}
                    />
                    <div
                      className="absolute top-1/2 h-px -translate-y-1/2"
                      style={{
                        left: `${minP}%`,
                        width: `${Math.max(0.5, maxP - minP)}%`,
                        background: "var(--text-tertiary)",
                      }}
                    />
                    <div
                      className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-sm"
                      style={{
                        left: `${p25P}%`,
                        width: `${Math.max(1, p75P - p25P)}%`,
                        background: "var(--mint-soft)",
                        border: "1px solid var(--mint)",
                      }}
                    />
                    <div
                      className="absolute top-1/2 w-0.5 h-3 -translate-y-1/2"
                      style={{
                        left: `${medP}%`,
                        background: "var(--mint-bright)",
                      }}
                    />
                  </div>
                  <div className="w-16 text-right shrink-0">
                    <div
                      className="text-[11px] font-extrabold tabular-nums"
                      style={{ color: "var(--mint)" }}
                    >
                      {t.median.toFixed(1)}%
                    </div>
                    <div
                      className="text-[9px]"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      ±{iqrHalf.toFixed(1)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="flex gap-3 mt-3 text-[10px] font-semibold flex-wrap"
            style={{ color: "var(--text-secondary)" }}
          >
            <span className="flex items-center gap-1">
              <span
                className="w-3 h-px"
                style={{ background: "var(--text-tertiary)" }}
              />{" "}
              Min–Max
            </span>
            <span className="flex items-center gap-1">
              <span
                className="w-3 h-2"
                style={{
                  background: "var(--mint-soft)",
                  border: "1px solid var(--mint)",
                }}
              />{" "}
              25%–75% Quantil
            </span>
            <span className="flex items-center gap-1">
              <span
                className="w-0.5 h-3"
                style={{ background: "var(--mint-bright)" }}
              />{" "}
              Median
            </span>
          </div>

          <InfoBanner icon="i" className="mt-3">
            <strong>Lesehilfe:</strong> Eine <strong>schmale Box</strong>{" "}
            bedeutet, dass die Titelchance auch bei stark veränderten Gewichten
            ähnlich bleibt — die Vorhersage ist robust. Eine{" "}
            <strong>breite Box</strong> heißt: das Ergebnis hängt stark von
            Deinen Einstellungen ab.
          </InfoBanner>
        </>
      )}
    </>
  );
}
