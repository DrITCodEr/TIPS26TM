"use client";

import { useMemo } from "react";
import { useSimulationStore } from "@/lib/stores/simulationStore";
import { TEAMS } from "@/lib/data/teams";
import { SCHEDULE } from "@/lib/data/schedule";
import { MARKT_QUOTEN, ODDS_META } from "@/lib/data/marktQuoten";
import {
  calculateMatchEdges,
  calculateTitelEdge,
} from "@/lib/algorithms/edgeAnalysis";
import { EmptyResult } from "./EmptyResult";
import { AlgorithmBadge } from "@/components/ui/AlgorithmBadge";
import { SectionTitle } from "@/components/ui/Card";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { signed } from "@/lib/utils/format";

function edgePillStyle(edge: number, threshold = 0.5): React.CSSProperties {
  const abs = Math.abs(edge);
  if (abs < threshold) {
    return {
      background: "var(--bg-tertiary)",
      color: "var(--text-secondary)",
    };
  }
  return edge > 0
    ? {
        background: "rgba(94, 234, 212, 0.15)",
        color: "var(--mint)",
        border: "1px solid var(--mint)",
      }
    : {
        background: "rgba(249, 115, 22, 0.15)",
        color: "var(--orange)",
        border: "1px solid var(--orange)",
      };
}

export function EdgeAnalysis() {
  const result = useSimulationStore((s) => s.simulationResult);

  const titelEdges = useMemo(
    () =>
      result ? calculateTitelEdge(result, TEAMS, MARKT_QUOTEN).slice(0, 20) : [],
    [result],
  );
  const matchEdges = useMemo(
    () =>
      result
        ? calculateMatchEdges(result, TEAMS, SCHEDULE, MARKT_QUOTEN)
            .sort((a, b) => b.maxAbsEdge - a.maxAbsEdge)
            .slice(0, 15)
        : [],
    [result],
  );

  if (!result) return <EmptyResult />;

  const titelMax = Math.max(
    1,
    ...titelEdges.map((t) => Math.max(t.simP, t.marktP)),
  );

  return (
    <>
      <AlgorithmBadge />
      <InfoBanner icon="📈">
        <strong>Value-Bet-Analyse:</strong> Wo weicht TIPS-26 vom
        Buchmacher-Konsens ab? <strong>Positiver Edge</strong> = Modell sieht
        mehr Chance als der Markt. <strong>Negativer Edge</strong> = Markt
        überschätzt das Team.
      </InfoBanner>

      <SectionTitle>🏆 Titel-Edge (echte Markt-Daten)</SectionTitle>
      <div
        className="text-[10px] mb-2 px-1"
        style={{ color: "var(--text-tertiary)" }}
      >
        Markt-Quoten Stand{" "}
        <strong style={{ color: "var(--text-secondary)" }}>
          {ODDS_META.stand}
        </strong>{" "}
        · aggregiert aus {ODDS_META.quellen.join(", ")}. Bookmaker-Margin
        mathematisch entzerrt.
      </div>

      <div className="space-y-1.5">
        {titelEdges.map((t) => {
          const simW = Math.max(1, (t.simP / titelMax) * 100);
          const marktW = Math.max(1, (t.marktP / titelMax) * 100);
          return (
            <div
              key={t.teamIdx}
              className="rounded-xl p-2.5"
              style={{
                background:
                  t.name === "Deutschland"
                    ? "rgba(239, 68, 68, 0.08)"
                    : "var(--bg-card)",
                border:
                  t.name === "Deutschland"
                    ? "1px solid rgba(239, 68, 68, 0.3)"
                    : "1px solid var(--border-subtle)",
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[16px]">{t.flag}</span>
                  <span className="text-[12px] font-bold">{t.name}</span>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-extrabold tabular-nums"
                  style={edgePillStyle(t.edge, 0.5)}
                >
                  {signed(t.edge)} pp
                </span>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] w-9 shrink-0 font-bold uppercase"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Markt
                  </span>
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-tertiary)" }}
                  >
                    <div
                      style={{
                        width: `${marktW}%`,
                        height: "100%",
                        background: "rgba(148, 163, 184, 0.6)",
                      }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-bold tabular-nums w-10 text-right"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {t.marktP.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] w-9 shrink-0 font-bold uppercase"
                    style={{ color: "var(--mint)" }}
                  >
                    Sim
                  </span>
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-tertiary)" }}
                  >
                    <div
                      style={{
                        width: `${simW}%`,
                        height: "100%",
                        background: "var(--mint)",
                      }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-bold tabular-nums w-10 text-right"
                    style={{ color: "var(--mint)" }}
                  >
                    {t.simP.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <SectionTitle>⚽ Match-Edge (markt-konsistente Quoten)</SectionTitle>
      <InfoBanner icon="ⓘ">
        Match-Quoten der meisten Spiele sind noch nicht öffentlich verfügbar.
        Hier aus Outright-Quoten + Poisson-Modell{" "}
        <strong>markt-konsistent abgeleitet</strong>. Top 15 mit größter
        Abweichung:
      </InfoBanner>

      <div className="space-y-2">
        {matchEdges.map((e) => {
          const isGermany =
            e.teamA === "Deutschland" || e.teamB === "Deutschland";
          const idxA = TEAMS.findIndex((t) => t.name === e.teamA);
          const idxB = TEAMS.findIndex((t) => t.name === e.teamB);

          const row = (
            label: string,
            market: number,
            sim: number,
            edge: number,
          ) => (
            <div className="flex items-center gap-2 text-[11px] tabular-nums">
              <span
                className="w-4 font-extrabold"
                style={{ color: "var(--mint)" }}
              >
                {label}
              </span>
              <span
                className="flex-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                M:{" "}
                <strong style={{ color: "var(--text-secondary)" }}>
                  {market.toFixed(0)}%
                </strong>
              </span>
              <span
                className="flex-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                S:{" "}
                <strong style={{ color: "var(--mint)" }}>
                  {sim.toFixed(0)}%
                </strong>
              </span>
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold w-12 text-center"
                style={edgePillStyle(edge, 2)}
              >
                {signed(edge)}
              </span>
            </div>
          );

          return (
            <div
              key={e.matchIdx}
              className="rounded-2xl p-3"
              style={{
                background: "var(--bg-card)",
                border: isGermany
                  ? "1px solid rgba(239, 68, 68, 0.3)"
                  : "1px solid var(--border-subtle)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-[12px] font-bold truncate">
                  {TEAMS[idxA].flag} {e.teamA}{" "}
                  <span
                    className="font-normal"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    vs
                  </span>{" "}
                  {TEAMS[idxB].flag} {e.teamB}
                </div>
                <div
                  className="text-[10px] shrink-0 ml-2"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {e.date.split(",")[0]} · {e.time}
                </div>
              </div>
              <div className="space-y-1">
                {row("1", e.marketWinA, e.simWinA, e.edgeWinA)}
                {row("X", e.marketDraw, e.simDraw, e.edgeDraw)}
                {row("2", e.marketWinB, e.simWinB, e.edgeWinB)}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
