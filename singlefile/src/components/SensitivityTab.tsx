import { useMemo } from "react";
import { useStore } from "@/store";
import { useRunSensitivity } from "@/runHooks";
import { AlgorithmBadge, Button, InfoBanner, SectionTitle } from "./ui";

export function SensitivityTab() {
  const algorithm = useStore((s) => s.algorithm);
  const sensRange = useStore((s) => s.sensRangePercent);
  const setSensRange = useStore((s) => s.setSensRangePercent);
  const result = useStore((s) => s.sensitivityResult);
  const loading = useStore((s) => s.loading.kind);
  const run = useRunSensitivity();

  const sorted = useMemo(() => {
    if (!result) return [];
    return [...result.stats].sort((a, b) => b.median - a.median).slice(0, 16);
  }, [result]);

  const axisMax = useMemo(() => {
    if (sorted.length === 0) return 20;
    return Math.max(5, Math.ceil(sorted[0].max * 1.1));
  }, [sorted]);

  return (
    <section>
      <AlgorithmBadge algorithm={algorithm} />
      <InfoBanner icon="📈">
        <strong>Wie stabil ist die Vorhersage?</strong> Die Analyse variiert alle 9 Gewichtungsfaktoren zufällig und prüft, ob das Ranking robust bleibt.
      </InfoBanner>

      <SectionTitle>⚙️ Variations-Stärke</SectionTitle>
      <div className="card">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {([15, 30, 50] as const).map((p) => (
            <Button key={p} active={sensRange === p} onClick={() => setSensRange(p)}>
              ±{p}% {p === 15 ? "sanft" : p === 30 ? "standard" : "stark"}
            </Button>
          ))}
        </div>
        <div style={{ fontSize: 10, marginTop: 8, color: "var(--text-tertiary)" }}>
          Jeder Faktor wird zufällig um ±{sensRange}% des aktuellen Werts variiert.
        </div>
      </div>

      <div className="sim-controls">
        <Button variant="primary" full disabled={loading !== null} onClick={run}>
          {loading === "sensitivity" ? "⏳ Analysiere ..." : "📊 Sensitivitätsanalyse starten · 20 × 500"}
        </Button>
        <div className="sim-status">~10 Sekunden Laufzeit</div>
      </div>

      {result && (
        <>
          <SectionTitle>📊 Titelchance ± Streuung</SectionTitle>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700, marginBottom: 8, padding: "0 4px", color: "var(--text-tertiary)" }}>
            <span>0%</span><span>{(axisMax / 2).toFixed(0)}%</span><span>{axisMax.toFixed(0)}%</span>
          </div>
          <div>
            {sorted.map((t) => {
              const toPct = (v: number) => Math.min(100, (v / axisMax) * 100);
              const minP = toPct(t.min);
              const maxP = toPct(t.max);
              const p25P = toPct(t.p25);
              const p75P = toPct(t.p75);
              const medP = toPct(t.median);
              const iqrHalf = (t.p75 - t.p25) / 2;
              return (
                <div key={t.idx} className={`sens-row ${t.name === "Deutschland" ? "is-germany" : ""}`}>
                  <div className="sens-name-block">
                    <span style={{ fontSize: 14 }}>{t.flag}</span>
                    <span className="sens-name">{t.name}</span>
                  </div>
                  <div className="sens-chart">
                    <div className="sens-track" />
                    <div className="sens-whisker" style={{ left: `${minP}%`, width: `${Math.max(0.5, maxP - minP)}%` }} />
                    <div className="sens-box" style={{ left: `${p25P}%`, width: `${Math.max(1, p75P - p25P)}%` }} />
                    <div className="sens-median" style={{ left: `${medP}%` }} />
                  </div>
                  <div className="sens-value">
                    <div className="sens-value-main">{t.median.toFixed(1)}%</div>
                    <div className="sens-value-range">±{iqrHalf.toFixed(1)}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <InfoBanner icon="i" style={{ marginTop: 12 }}>
            <strong>Lesehilfe:</strong> Schmale Box = robust gegen Gewichts-Änderungen. Breite Box = sensitiv.
          </InfoBanner>
        </>
      )}
    </section>
  );
}
