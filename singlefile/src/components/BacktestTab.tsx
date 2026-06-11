import { useMemo } from "react";
import { useStore } from "@/store";
import {
  checkChampionRanks,
  runBacktest,
  type BacktestAlgorithm,
} from "@lib/algorithms/backtest";
import {
  HISTORICAL_TOURNAMENTS,
  HISTORICAL_YEARS,
  type HistoricalYear,
} from "@lib/data/historical";
import { PRESETS } from "@lib/data/presets";
import { useT } from "@/i18n";
import { Button, Card, InfoBanner, SectionTitle } from "./ui";

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div style={{ textAlign: "center", padding: 12, borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-tertiary)" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4, color: "var(--mint)", fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {hint && <div style={{ fontSize: 9, marginTop: 2, color: "var(--text-tertiary)" }}>{hint}</div>}
    </div>
  );
}

export function BacktestTab({ onBack }: { onBack: () => void }) {
  const year = useStore((s) => s.backtestYear);
  const algorithm = useStore((s) => s.backtestAlgorithm);
  const setYear = useStore((s) => s.setBacktestYear);
  const setAlgorithm = useStore((s) => s.setBacktestAlgorithm);
  const { t } = useT();

  const tournament = HISTORICAL_TOURNAMENTS[year];
  const report = useMemo(
    () => runBacktest(tournament, PRESETS.default, algorithm),
    [tournament, algorithm],
  );
  const champInfo = useMemo(
    () => checkChampionRanks(tournament, PRESETS.default),
    [tournament],
  );

  const phaseLabels: Record<string, string> = {
    r16: t.backtest.phaseR16,
    qf: t.backtest.phaseQF,
    sf: t.backtest.phaseSF,
    "3rd": t.backtest.phase3rd,
    final: t.backtest.phaseFinal,
  };

  return (
    <section>
      <InfoBanner icon="🔬">
        <strong>{t.backtest.bannerStrong}</strong> {t.backtest.bannerText}
      </InfoBanner>

      <SectionTitle>{t.backtest.selectTournament}</SectionTitle>
      <div className="filter-row">
        {HISTORICAL_YEARS.map((y) => (
          <Button key={y} active={year === y} onClick={() => setYear(y as HistoricalYear)}>
            {t.backtest.yearWMHost(y, HISTORICAL_TOURNAMENTS[y].host)}
          </Button>
        ))}
      </div>

      <SectionTitle>{t.backtest.selectAlgo}</SectionTitle>
      <div className="filter-row">
        <Button active={algorithm === "v1"} onClick={() => setAlgorithm("v1" as BacktestAlgorithm)}>
          TIPS-26.1
        </Button>
        <Button active={algorithm === "v2-nomarket"} onClick={() => setAlgorithm("v2-nomarket" as BacktestAlgorithm)}>
          TIPS-26.2
        </Button>
      </div>
      <div style={{ fontSize: 10, marginTop: 4, color: "var(--text-tertiary)" }}>
        {t.backtest.algoHint}
      </div>

      <SectionTitle>{t.backtest.metricsTitle}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
        <Metric label={t.backtest.brier} value={report.metrics.brier.toFixed(3)} hint={t.backtest.lowerBetter} />
        <Metric label={t.backtest.logloss} value={report.metrics.logLoss.toFixed(3)} hint={t.backtest.lowerBetter} />
        <Metric label={t.backtest.rps} value={report.metrics.rps.toFixed(3)} hint={t.backtest.lowerBetter} />
        <Metric label={t.backtest.acc} value={`${(report.metrics.accuracy * 100).toFixed(0)}%`} hint={t.backtest.higherBetter} />
      </div>
      <div style={{ fontSize: 10, marginTop: 8, padding: "0 4px", color: "var(--text-tertiary)" }}>
        {t.backtest.nKO(report.metrics.count)}
      </div>

      <SectionTitle>{t.backtest.rankingTitle}</SectionTitle>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)" }}>{t.backtest.actualChampion}</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{tournament.champion}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--mint)" }}>
              {t.backtest.modelRank} {champInfo.championRank}/{tournament.teams.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)" }}>{t.backtest.runnerUp}</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{tournament.runnerUp}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--mint)" }}>
              {t.backtest.modelRank} {champInfo.runnerUpRank}/{tournament.teams.length}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12, paddingTop: 12, fontSize: 11, color: "var(--text-secondary)", borderTop: "1px solid var(--border-subtle)" }}>
          {t.backtest.semiFinalists} <strong>{tournament.semiFinalists[0]}</strong> ({t.backtest.modelRank.replace(":", "")} {champInfo.sfRanks[0]}) · <strong>{tournament.semiFinalists[1]}</strong> ({t.backtest.modelRank.replace(":", "")} {champInfo.sfRanks[1]})
        </div>
      </Card>

      <SectionTitle>{t.backtest.perMatchTitle}</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {report.perMatch.map((p, i) => {
          const m = p.match;
          const a = (p.forecast.winA * 100).toFixed(0);
          const x = (p.forecast.draw * 100).toFixed(0);
          const b = (p.forecast.winB * 100).toFixed(0);
          const expected = p.forecast.winA >= p.forecast.draw && p.forecast.winA >= p.forecast.winB ? "1"
            : p.forecast.winB > p.forecast.draw ? "2" : "X";
          const correct = expected === p.actual;
          return (
            <div
              key={i}
              style={{
                padding: "8px 12px", borderRadius: 12,
                background: correct ? "rgba(94,234,212,0.08)" : "rgba(249,115,22,0.06)",
                border: correct ? "1px solid rgba(94,234,212,0.25)" : "1px solid rgba(249,115,22,0.25)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 2 }}>
                    {phaseLabels[m.phase] ?? m.phase}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.teamA} {m.goalsA}–{m.goalsB} {m.teamB}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 2 }}>
                    {(["1", "X", "2"] as const).map((label, idx) => {
                      const v = [a, x, b][idx];
                      const sel = p.actual === label;
                      return (
                        <span
                          key={label}
                          style={{
                            fontSize: 10, fontWeight: 800, padding: "2px 6px",
                            borderRadius: 6, fontVariantNumeric: "tabular-nums",
                            background: sel ? "var(--mint)" : "var(--bg-tertiary)",
                            color: sel ? "var(--bg-deep)" : "var(--text-secondary)",
                          }}
                        >
                          {v}%
                        </span>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: correct ? "var(--mint)" : "var(--orange)" }}>
                    {correct ? t.backtest.hit : t.backtest.miss}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <InfoBanner icon="⚠️" tone="warning" style={{ marginTop: 16 }}>
        <strong>{t.backtest.dataQualityWarn}</strong>
      </InfoBanner>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <span
          style={{ fontSize: 11, fontWeight: 700, color: "var(--mint)", textDecoration: "underline", cursor: "pointer" }}
          onClick={onBack}
        >
          {t.backtest.back}
        </span>
      </div>
    </section>
  );
}
