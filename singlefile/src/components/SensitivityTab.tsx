import { useMemo } from "react";
import { useStore } from "@/store";
import { useRunSensitivity } from "@/runHooks";
import { useT } from "@/i18n";
import { AlgorithmBadge, Button, InfoBanner, SectionTitle } from "./ui";

export function SensitivityTab() {
  const algorithm = useStore((s) => s.algorithm);
  const sensRange = useStore((s) => s.sensRangePercent);
  const setSensRange = useStore((s) => s.setSensRangePercent);
  const result = useStore((s) => s.sensitivityResult);
  const loading = useStore((s) => s.loading.kind);
  const run = useRunSensitivity();
  const { t, teamName } = useT();

  const sorted = useMemo(() => {
    if (!result) return [];
    return [...result.stats].sort((a, b) => b.median - a.median).slice(0, 16);
  }, [result]);

  const axisMax = useMemo(() => {
    if (sorted.length === 0) return 20;
    return Math.max(5, Math.ceil(sorted[0].max * 1.1));
  }, [sorted]);

  const presetLabel = (p: 15 | 30 | 50) =>
    p === 15 ? t.sensitivity.presetSoft : p === 30 ? t.sensitivity.presetStandard : t.sensitivity.presetStrong;

  return (
    <section>
      <AlgorithmBadge algorithm={algorithm} />
      <InfoBanner icon="📈">
        <strong>{t.sensitivity.bannerStrong}</strong> {t.sensitivity.bannerText}
      </InfoBanner>

      <SectionTitle>{t.sensitivity.variationTitle}</SectionTitle>
      <div className="card">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {([15, 30, 50] as const).map((p) => (
            <Button key={p} active={sensRange === p} onClick={() => setSensRange(p)}>
              {presetLabel(p)}
            </Button>
          ))}
        </div>
        <div style={{ fontSize: 10, marginTop: 8, color: "var(--text-tertiary)" }}>
          {t.sensitivity.variationHint(sensRange)}
        </div>
      </div>

      <div className="sim-controls">
        <Button variant="primary" full disabled={loading !== null} onClick={run}>
          {loading === "sensitivity" ? t.sensitivity.runButtonBusy : t.sensitivity.runButton}
        </Button>
        <div className="sim-status">{t.sensitivity.runtimeHint}</div>
      </div>

      {result && (
        <>
          <SectionTitle>{t.sensitivity.chartTitle}</SectionTitle>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700, marginBottom: 8, padding: "0 4px", color: "var(--text-tertiary)" }}>
            <span>0%</span><span>{(axisMax / 2).toFixed(0)}%</span><span>{axisMax.toFixed(0)}%</span>
          </div>
          <div>
            {sorted.map((stat) => {
              const toPct = (v: number) => Math.min(100, (v / axisMax) * 100);
              const minP = toPct(stat.min);
              const maxP = toPct(stat.max);
              const p25P = toPct(stat.p25);
              const p75P = toPct(stat.p75);
              const medP = toPct(stat.median);
              const iqrHalf = (stat.p75 - stat.p25) / 2;
              return (
                <div key={stat.idx} className={`sens-row ${stat.name === "Deutschland" ? "is-germany" : ""}`}>
                  <div className="sens-name-block">
                    <span style={{ fontSize: 14 }}>{stat.flag}</span>
                    <span className="sens-name">{teamName(stat.name)}</span>
                  </div>
                  <div className="sens-chart">
                    <div className="sens-track" />
                    <div className="sens-whisker" style={{ left: `${minP}%`, width: `${Math.max(0.5, maxP - minP)}%` }} />
                    <div className="sens-box" style={{ left: `${p25P}%`, width: `${Math.max(1, p75P - p25P)}%` }} />
                    <div className="sens-median" style={{ left: `${medP}%` }} />
                  </div>
                  <div className="sens-value">
                    <div className="sens-value-main">{stat.median.toFixed(1)}%</div>
                    <div className="sens-value-range">±{iqrHalf.toFixed(1)}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <InfoBanner icon="i" style={{ marginTop: 12 }}>
            <strong>{t.sensitivity.legendHelp}</strong> {t.sensitivity.legendNarrow}
          </InfoBanner>
        </>
      )}
    </section>
  );
}
