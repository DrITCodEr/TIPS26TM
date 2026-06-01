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
import { Button, Card, InfoBanner, SectionTitle } from "./ui";

function metric(label: string, value: string, hint?: string) {
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

  const tournament = HISTORICAL_TOURNAMENTS[year];
  const report = useMemo(
    () => runBacktest(tournament, PRESETS.default, algorithm),
    [tournament, algorithm],
  );
  const champInfo = useMemo(
    () => checkChampionRanks(tournament, PRESETS.default),
    [tournament],
  );

  return (
    <section>
      <InfoBanner icon="🔬">
        <strong>Historisches Backtesting.</strong> Wie gut hätte TIPS-26 mit Pre-Turnier-Daten den Verlauf der WMs 2014/18/22 vorhergesagt?
      </InfoBanner>

      <SectionTitle>🏆 Turnier wählen</SectionTitle>
      <div className="filter-row">
        {HISTORICAL_YEARS.map((y) => (
          <Button key={y} active={year === y} onClick={() => setYear(y as HistoricalYear)}>
            WM {y} · {HISTORICAL_TOURNAMENTS[y].host}
          </Button>
        ))}
      </div>

      <SectionTitle>🧮 Algorithmus</SectionTitle>
      <div className="filter-row">
        <Button active={algorithm === "v1"} onClick={() => setAlgorithm("v1" as BacktestAlgorithm)}>
          TIPS-26.1
        </Button>
        <Button active={algorithm === "v2-nomarket"} onClick={() => setAlgorithm("v2-nomarket" as BacktestAlgorithm)}>
          TIPS-26.2 ohne Markt
        </Button>
      </div>
      <div style={{ fontSize: 10, marginTop: 4, color: "var(--text-tertiary)" }}>
        v2 Advanced braucht Pre-Turnier-Bookmaker-Quoten (haben wir nicht). Daher hier ohne Markt-Blend.
      </div>

      <SectionTitle>📊 Aggregierte Metriken (K.o.-Phase)</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
        {metric("Brier", report.metrics.brier.toFixed(3), "↓ besser")}
        {metric("Log-Loss", report.metrics.logLoss.toFixed(3), "↓ besser")}
        {metric("RPS", report.metrics.rps.toFixed(3), "↓ besser")}
        {metric("Acc", `${(report.metrics.accuracy * 100).toFixed(0)}%`, "↑ besser")}
      </div>
      <div style={{ fontSize: 10, marginTop: 8, padding: "0 4px", color: "var(--text-tertiary)" }}>
        N = {report.metrics.count} K.o.-Spiele · Random-Baseline: Brier ≈ 0.667 · Log-Loss ≈ 1.099
      </div>

      <SectionTitle>🥇 Champion-Ranking (Pre-Turnier)</SectionTitle>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)" }}>Tatsächlicher Champion</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{tournament.champion}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--mint)" }}>
              Modell-Rang: {champInfo.championRank}/{tournament.teams.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)" }}>Finalist</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{tournament.runnerUp}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--mint)" }}>
              Modell-Rang: {champInfo.runnerUpRank}/{tournament.teams.length}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12, paddingTop: 12, fontSize: 11, color: "var(--text-secondary)", borderTop: "1px solid var(--border-subtle)" }}>
          Halbfinalisten: <strong>{tournament.semiFinalists[0]}</strong> (Rang {champInfo.sfRanks[0]}) · <strong>{tournament.semiFinalists[1]}</strong> (Rang {champInfo.sfRanks[1]})
        </div>
      </Card>

      <SectionTitle>📈 Per-Match-Forecasts</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {report.perMatch.map((p, i) => {
          const m = p.match;
          const phaseLabels: Record<string, string> = {
            r16: "1/8", qf: "1/4", sf: "1/2", "3rd": "Spiel um 3.", final: "Finale",
          };
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
                    {correct ? "✓ getroffen" : "✗ verfehlt"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <InfoBanner icon="⚠️" tone="warning" style={{ marginTop: 16 }}>
        <strong>Daten-Qualität:</strong> Pre-Turnier-Snapshots sind Demo-Annäherungen (Roadmap §9.3).
      </InfoBanner>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <span
          style={{ fontSize: 11, fontWeight: 700, color: "var(--mint)", textDecoration: "underline", cursor: "pointer" }}
          onClick={onBack}
        >
          ← Zurück zur Übersicht
        </span>
      </div>
    </section>
  );
}
