"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  HISTORICAL_TOURNAMENTS,
  HISTORICAL_YEARS,
  type HistoricalYear,
} from "@/lib/data/historical";
import {
  runBacktest,
  checkChampionRanks,
  type BacktestAlgorithm,
} from "@/lib/algorithms/backtest";
import { useSimulationStore } from "@/lib/stores/simulationStore";
import { PRESETS } from "@/lib/data/presets";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { InfoBanner } from "@/components/ui/InfoBanner";

type WeightsMode = "current" | "default";

function metricBadge(label: string, value: string, hint?: string) {
  return (
    <div
      className="rounded-2xl p-3 text-center"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div
        className="text-[9px] font-bold uppercase tracking-wider"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </div>
      <div
        className="text-[18px] font-extrabold mt-1 tabular-nums"
        style={{ color: "var(--mint)" }}
      >
        {value}
      </div>
      {hint && (
        <div
          className="text-[9px] mt-0.5"
          style={{ color: "var(--text-tertiary)" }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

export function BacktestView() {
  const [year, setYear] = useState<HistoricalYear>(2022);
  const [algorithm, setAlgorithm] = useState<BacktestAlgorithm>("v1");
  const [weightsMode, setWeightsMode] = useState<WeightsMode>("default");

  const currentWeights = useSimulationStore((s) => s.weights);
  const weights = weightsMode === "current" ? currentWeights : PRESETS.default;

  const tournament = HISTORICAL_TOURNAMENTS[year];
  const report = useMemo(
    () => runBacktest(tournament, weights, algorithm),
    [tournament, weights, algorithm],
  );
  const champInfo = useMemo(
    () => checkChampionRanks(tournament, weights),
    [tournament, weights],
  );

  const populatedBins = report.calibration.filter((b) => b.count > 0);

  return (
    <>
      <InfoBanner icon="🔬">
        <strong>Historisches Backtesting</strong> — wie gut hätte TIPS-26 mit
        den Pre-Turnier-Daten den Verlauf der WMs 2014, 2018 und 2022
        vorhergesagt? Demo-Daten, daher Annäherung; reicht zur
        Pipeline-Validierung.
      </InfoBanner>

      <SectionTitle>🏆 Turnier wählen</SectionTitle>
      <div className="flex gap-2 flex-wrap">
        {HISTORICAL_YEARS.map((y) => (
          <Button key={y} active={year === y} onClick={() => setYear(y)}>
            WM {y} · {HISTORICAL_TOURNAMENTS[y].host}
          </Button>
        ))}
      </div>

      <SectionTitle>🧮 Algorithmus + Gewichte</SectionTitle>
      <div className="flex gap-2 flex-wrap mb-2">
        <Button
          active={algorithm === "v1"}
          onClick={() => setAlgorithm("v1")}
        >
          TIPS-26.1
        </Button>
        <Button
          active={algorithm === "v2-nomarket"}
          onClick={() => setAlgorithm("v2-nomarket")}
        >
          TIPS-26.2 ohne Markt
        </Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button
          active={weightsMode === "default"}
          onClick={() => setWeightsMode("default")}
        >
          Default-Preset
        </Button>
        <Button
          active={weightsMode === "current"}
          onClick={() => setWeightsMode("current")}
        >
          Aktuelle Setup-Gewichte
        </Button>
      </div>
      <div
        className="text-[10px] mt-1.5"
        style={{ color: "var(--text-tertiary)" }}
      >
        TIPS-26.2 Advanced benötigt Pre-Turnier-Bookmaker-Quoten (die für
        historische WMs nicht in unserem Datensatz liegen). Daher hier nur
        Variante ohne Markt-Blend.
      </div>

      <SectionTitle>📊 Aggregierte Metriken (K.o.-Phase)</SectionTitle>
      <div className="grid grid-cols-4 gap-2">
        {metricBadge(
          "Brier",
          report.metrics.brier.toFixed(3),
          "↓ niedriger ist besser",
        )}
        {metricBadge(
          "Log-Loss",
          report.metrics.logLoss.toFixed(3),
          "↓ niedriger ist besser",
        )}
        {metricBadge(
          "RPS",
          report.metrics.rps.toFixed(3),
          "↓ niedriger ist besser",
        )}
        {metricBadge(
          "Accuracy",
          `${(report.metrics.accuracy * 100).toFixed(0)}%`,
          "↑ höher ist besser",
        )}
      </div>
      <div
        className="text-[10px] mt-2 px-1"
        style={{ color: "var(--text-tertiary)" }}
      >
        N = {report.metrics.count} K.o.-Spiele · Random-Guess-Baseline: Brier
        ≈ 0.667 · Log-Loss ≈ 1.099
      </div>

      <SectionTitle>🥇 Champion-Ranking (Pre-Turnier-Stärke)</SectionTitle>
      <Card>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Tatsächlicher Champion
            </div>
            <div className="text-[14px] font-extrabold mt-1">
              {tournament.champion}
            </div>
            <div
              className="text-[12px] font-bold mt-0.5"
              style={{ color: "var(--mint)" }}
            >
              Modell-Rang: {champInfo.championRank}/{tournament.teams.length}
            </div>
          </div>
          <div>
            <div
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Finalist
            </div>
            <div className="text-[14px] font-extrabold mt-1">
              {tournament.runnerUp}
            </div>
            <div
              className="text-[12px] font-bold mt-0.5"
              style={{ color: "var(--mint)" }}
            >
              Modell-Rang: {champInfo.runnerUpRank}/{tournament.teams.length}
            </div>
          </div>
        </div>
        <div
          className="mt-3 pt-3 text-[11px]"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          Verlorene Halbfinalisten:{" "}
          <strong>{tournament.semiFinalists[0]}</strong> (Rang{" "}
          {champInfo.sfRanks[0]}) ·{" "}
          <strong>{tournament.semiFinalists[1]}</strong> (Rang{" "}
          {champInfo.sfRanks[1]})
        </div>
      </Card>

      <SectionTitle>📈 Per-Match-Forecasts</SectionTitle>
      <div className="space-y-1.5">
        {report.perMatch.map((p, i) => {
          const m = p.match;
          const phaseLabels: Record<string, string> = {
            r16: "1/8",
            qf: "1/4",
            sf: "1/2",
            "3rd": "Spiel um 3.",
            final: "Finale",
          };
          // Forecast als Heim/Remis/Auswärts in %
          const a = (p.forecast.winA * 100).toFixed(0);
          const x = (p.forecast.draw * 100).toFixed(0);
          const b = (p.forecast.winB * 100).toFixed(0);
          const expected = p.forecast.winA >= p.forecast.draw && p.forecast.winA >= p.forecast.winB
            ? "1"
            : p.forecast.winB > p.forecast.draw
              ? "2"
              : "X";
          const correct = expected === p.actual;
          return (
            <div
              key={i}
              className="rounded-xl px-3 py-2"
              style={{
                background: correct
                  ? "rgba(94, 234, 212, 0.08)"
                  : "rgba(249, 115, 22, 0.06)",
                border: correct
                  ? "1px solid rgba(94, 234, 212, 0.25)"
                  : "1px solid rgba(249, 115, 22, 0.25)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[9px] font-bold uppercase tracking-wider mb-0.5"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {phaseLabels[m.phase] ?? m.phase}
                  </div>
                  <div className="text-[12px] font-bold truncate">
                    {m.teamA} {m.goalsA}–{m.goalsB} {m.teamB}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className="flex gap-1 mb-0.5">
                    <span
                      className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md tabular-nums"
                      style={{
                        background:
                          p.actual === "1"
                            ? "var(--mint)"
                            : "var(--bg-tertiary)",
                        color:
                          p.actual === "1"
                            ? "var(--bg-deep)"
                            : "var(--text-secondary)",
                      }}
                    >
                      {a}%
                    </span>
                    <span
                      className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md tabular-nums"
                      style={{
                        background:
                          p.actual === "X"
                            ? "var(--mint)"
                            : "var(--bg-tertiary)",
                        color:
                          p.actual === "X"
                            ? "var(--bg-deep)"
                            : "var(--text-secondary)",
                      }}
                    >
                      {x}%
                    </span>
                    <span
                      className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md tabular-nums"
                      style={{
                        background:
                          p.actual === "2"
                            ? "var(--mint)"
                            : "var(--bg-tertiary)",
                        color:
                          p.actual === "2"
                            ? "var(--bg-deep)"
                            : "var(--text-secondary)",
                      }}
                    >
                      {b}%
                    </span>
                  </div>
                  <div
                    className="text-[9px] font-bold"
                    style={{
                      color: correct ? "var(--mint)" : "var(--orange)",
                    }}
                  >
                    {correct ? "✓ getroffen" : "✗ verfehlt"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <SectionTitle>🎯 Reliability-Diagramm</SectionTitle>
      <Card>
        <div
          className="text-[10px] mb-3"
          style={{ color: "var(--text-tertiary)" }}
        >
          Pro Forecast-Bin: <strong>vorhergesagt</strong> vs.{" "}
          <strong>tatsächlich</strong> beobachtet. Perfekt kalibriert =
          Diagonale.
        </div>
        <div className="space-y-1.5">
          {populatedBins.map((b, i) => {
            const predicted = b.predicted * 100;
            const observed = b.observed * 100;
            const gap = Math.abs(predicted - observed);
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="text-[10px] w-12 shrink-0 tabular-nums"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {(b.binCenter * 100).toFixed(0)}%
                </div>
                <div className="relative flex-1 h-5">
                  <div
                    className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
                    style={{ background: "var(--bg-tertiary)" }}
                  />
                  <div
                    className="absolute top-1 h-1.5 rounded-sm"
                    style={{
                      left: `${Math.min(predicted, observed)}%`,
                      width: `${Math.max(1, gap)}%`,
                      background: gap < 10 ? "var(--mint-soft)" : "rgba(249, 115, 22, 0.18)",
                    }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5"
                    style={{
                      left: `${predicted}%`,
                      background: "var(--text-tertiary)",
                    }}
                    title="vorhergesagt"
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5"
                    style={{
                      left: `${observed}%`,
                      background: "var(--mint-bright)",
                    }}
                    title="beobachtet"
                  />
                </div>
                <div
                  className="text-[10px] w-16 shrink-0 text-right tabular-nums"
                  style={{ color: "var(--text-secondary)" }}
                >
                  n={b.count}
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="flex gap-3 mt-3 text-[10px]"
          style={{ color: "var(--text-secondary)" }}
        >
          <span className="flex items-center gap-1">
            <span
              className="w-0.5 h-3"
              style={{ background: "var(--text-tertiary)" }}
            />{" "}
            vorhergesagt
          </span>
          <span className="flex items-center gap-1">
            <span
              className="w-0.5 h-3"
              style={{ background: "var(--mint-bright)" }}
            />{" "}
            beobachtet
          </span>
        </div>
      </Card>

      <InfoBanner icon="⚠️" tone="warning" className="mt-4">
        <strong>Daten-Qualität:</strong> Diese Pre-Turnier-Snapshots sind
        Annäherungen aus öffentlich verfügbaren Quellen. Echte
        Backtest-Validierung erfordert präzise historische ELO-/FIFA-/Markt-
        Werte zum jeweiligen Stichtag (Roadmap §9.3).
      </InfoBanner>

      <div className="mt-4 text-center">
        <Link
          href="/"
          className="text-[11px] font-bold underline"
          style={{ color: "var(--mint)" }}
        >
          ← Zurück zur Übersicht
        </Link>
      </div>
    </>
  );
}
