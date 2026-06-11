"use client";

import { useState } from "react";
import { useSimulationStore } from "@/lib/stores/simulationStore";
import { TEAMS } from "@/lib/data/teams";
import { SCHEDULE } from "@/lib/data/schedule";
import { LIVE_RESULTS } from "@/lib/data/liveResults";
import { AlgorithmBadge } from "@/components/ui/AlgorithmBadge";
import { Button } from "@/components/ui/Button";
import { InfoBanner } from "@/components/ui/InfoBanner";

type Filter = "all" | "germany" | { group: string };

function filterMatches(f: Filter) {
  if (f === "all") return SCHEDULE.map((m, i) => ({ m, i }));
  if (f === "germany")
    return SCHEDULE.map((m, i) => ({ m, i })).filter(
      ({ m }) => m.teamA === "Deutschland" || m.teamB === "Deutschland",
    );
  return SCHEDULE.map((m, i) => ({ m, i })).filter(
    ({ m }) => m.group === f.group,
  );
}

export function MatchList() {
  const result = useSimulationStore((s) => s.simulationResult);
  const [filter, setFilter] = useState<Filter>("all");

  const N = result?.numSimulations ?? 0;

  const filtered = filterMatches(filter);
  const byDate: Record<string, { m: (typeof SCHEDULE)[number]; i: number }[]> = {};
  for (const entry of filtered) {
    if (!byDate[entry.m.date]) byDate[entry.m.date] = [];
    byDate[entry.m.date].push(entry);
  }

  const filterOptions: { label: string; value: Filter }[] = [
    { label: "Alle", value: "all" },
    { label: "🇩🇪 DFB", value: "germany" },
    ...["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map((g) => ({
      label: g,
      value: { group: g } as Filter,
    })),
  ];

  const finishedCount = Object.values(LIVE_RESULTS).filter((r) => r.isFinished).length;

  return (
    <>
      {result && <AlgorithmBadge />}
      <InfoBanner icon="⚽">
        <strong>Alle 72 Gruppenphasen-Spiele</strong> mit Datum, Anpfiff (MESZ),
        Stadion.{" "}
        {finishedCount > 0 && (
          <>
            <strong>{finishedCount}</strong> Spiel{finishedCount === 1 ? "" : "e"} live aktualisiert.{" "}
          </>
        )}
        {result ? (
          <>Mit Sieg-Wahrscheinlichkeiten aus der Simulation.</>
        ) : (
          <>Starte eine Simulation, um zusätzlich Sieg-Wahrscheinlichkeiten zu sehen.</>
        )}
      </InfoBanner>

      <div className="flex gap-1.5 flex-wrap mb-3">
        {filterOptions.map((opt) => {
          const isActive =
            (opt.value === "all" && filter === "all") ||
            (opt.value === "germany" && filter === "germany") ||
            (typeof opt.value === "object" &&
              typeof filter === "object" &&
              opt.value.group === filter.group);
          return (
            <Button
              key={
                typeof opt.value === "object"
                  ? `g-${opt.value.group}`
                  : opt.value
              }
              active={isActive}
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
            </Button>
          );
        })}
      </div>

      {Object.entries(byDate).map(([datum, matches]) => (
        <div key={datum}>
          <div
            className="text-[11px] uppercase tracking-wider font-bold mt-3 mb-2 px-1"
            style={{ color: "var(--text-tertiary)" }}
          >
            {datum}
          </div>
          <div className="space-y-2">
            {matches.map(({ m, i }) => {
              const liveResult = LIVE_RESULTS[i];
              const ms = result?.matchStats[i];
              const winA = ms ? (ms.winA / N) * 100 : 0;
              const draw = ms ? (ms.draw / N) * 100 : 0;
              const winB = ms ? (ms.winB / N) * 100 : 0;
              const avgA = ms ? (ms.goalsA / N).toFixed(1) : "";
              const avgB = ms ? (ms.goalsB / N).toFixed(1) : "";
              const avgTotal = ms
                ? ((ms.goalsA + ms.goalsB) / N).toFixed(1)
                : "";

              // Tail-Indikator: wie oft gibt es mindestens 4 / 6 Tore insgesamt?
              let countGe4 = 0;
              let countGe6 = 0;
              if (ms) {
                for (const k of Object.keys(ms.scores)) {
                  const [ga, gb] = k.split("-").map(Number);
                  const tot = ga + gb;
                  const c = ms.scores[k];
                  if (tot >= 4) countGe4 += c;
                  if (tot >= 6) countGe6 += c;
                }
              }
              const pctGe4 = ms ? ((countGe4 / N) * 100).toFixed(0) : "0";
              const pctGe6 = ms ? ((countGe6 / N) * 100).toFixed(0) : "0";

              const topScores = ms
                ? Object.entries(ms.scores)
                    .map(([k, v]) => ({ k, v }))
                    .sort((a, b) => b.v - a.v)
                    .slice(0, 6)
                : [];

              const tA = TEAMS[m.idxA!];
              const tB = TEAMS[m.idxB!];
              const isGermany =
                m.teamA === "Deutschland" || m.teamB === "Deutschland";

              // Hat das Sim-Modell den tatsächlichen Sieger getroffen?
              let simHitClass = "";
              if (liveResult?.isFinished && ms) {
                const actual =
                  liveResult.goalsA > liveResult.goalsB
                    ? "A"
                    : liveResult.goalsA < liveResult.goalsB
                      ? "B"
                      : "X";
                const predicted =
                  winA >= draw && winA >= winB
                    ? "A"
                    : winB > draw
                      ? "B"
                      : "X";
                simHitClass = predicted === actual ? "✓" : "✗";
              }

              return (
                <div
                  key={i}
                  className="rounded-2xl p-3"
                  style={{
                    background: liveResult?.isFinished
                      ? "rgba(94, 234, 212, 0.06)"
                      : "var(--bg-card)",
                    border: isGermany
                      ? "1px solid rgba(239, 68, 68, 0.3)"
                      : liveResult?.isFinished
                        ? "1px solid rgba(94, 234, 212, 0.25)"
                        : "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    className="text-[10px] mb-2 flex justify-between"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <span>
                      {m.time} · Gruppe {m.group}
                      {liveResult?.isFinished && (
                        <span
                          className="ml-2 px-1.5 py-0.5 rounded-full font-bold"
                          style={{
                            background: "var(--mint)",
                            color: "var(--bg-deep)",
                            fontSize: 9,
                          }}
                        >
                          ABGEPFIFFEN
                        </span>
                      )}
                    </span>
                    <span className="text-right max-w-[60%] truncate">
                      {m.venue}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-[18px]">{tA.flag}</span>
                      <span className="text-[13px] font-bold truncate">
                        {m.teamA}
                      </span>
                    </div>
                    {liveResult?.isFinished ? (
                      <span
                        className="text-[18px] font-extrabold px-3 tabular-nums"
                        style={{ color: "var(--mint)" }}
                      >
                        {liveResult.goalsA}:{liveResult.goalsB}
                        {liveResult.winnerByPenalties && (
                          <span
                            className="text-[10px] ml-1"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            i.E.
                          </span>
                        )}
                      </span>
                    ) : (
                      <span
                        className="text-[11px] font-bold px-2"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        vs
                      </span>
                    )}
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="text-[13px] font-bold truncate text-right">
                        {m.teamB}
                      </span>
                      <span className="text-[18px]">{tB.flag}</span>
                    </div>
                  </div>
                  {ms ? (
                    <>
                      <div
                        className="flex h-2 rounded-full overflow-hidden mb-1"
                        style={{ background: "var(--bg-tertiary)" }}
                      >
                        <div style={{ width: `${winA}%`, background: "var(--mint)" }} />
                        <div
                          style={{
                            width: `${draw}%`,
                            background: "rgba(148, 163, 184, 0.5)",
                          }}
                        />
                        <div
                          style={{
                            width: `${winB}%`,
                            background: "var(--mint-dark)",
                          }}
                        />
                      </div>
                      <div
                        className="flex justify-between text-[10px] font-bold tabular-nums"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <span>
                          1: {winA.toFixed(0)}%{" "}
                          {simHitClass && liveResult!.goalsA > liveResult!.goalsB && (
                            <span style={{ color: simHitClass === "✓" ? "var(--mint)" : "var(--orange)" }}>
                              {simHitClass}
                            </span>
                          )}
                        </span>
                        <span>
                          X: {draw.toFixed(0)}%{" "}
                          {simHitClass && liveResult!.goalsA === liveResult!.goalsB && (
                            <span style={{ color: simHitClass === "✓" ? "var(--mint)" : "var(--orange)" }}>
                              {simHitClass}
                            </span>
                          )}
                        </span>
                        <span>
                          2: {winB.toFixed(0)}%{" "}
                          {simHitClass && liveResult!.goalsA < liveResult!.goalsB && (
                            <span style={{ color: simHitClass === "✓" ? "var(--mint)" : "var(--orange)" }}>
                              {simHitClass}
                            </span>
                          )}
                        </span>
                      </div>
                      <div
                        className="mt-2.5 pt-2 flex items-center justify-between gap-2 text-[10px]"
                        style={{
                          borderTop: "1px solid var(--border-subtle)",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        <span>
                          ⌀{" "}
                          <strong style={{ color: "var(--text-primary)" }}>
                            {avgA}:{avgB}
                          </strong>{" "}
                          ({avgTotal} Tore) ·{" "}
                          <span style={{ color: "var(--mint)" }}>
                            ≥4: {pctGe4}%
                          </span>
                          {Number(pctGe6) > 0 && (
                            <>
                              {" · "}
                              <span style={{ color: "var(--mint)" }}>
                                ≥6: {pctGe6}%
                              </span>
                            </>
                          )}
                        </span>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {topScores.map(({ k, v }) => (
                            <span
                              key={k}
                              className="px-1.5 py-0.5 rounded-full font-bold"
                              style={{
                                background: "var(--bg-tertiary)",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {k} · {((v / N) * 100).toFixed(0)}%
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    !liveResult?.isFinished && (
                      <div
                        className="text-[11px] italic mt-1"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Starte eine Simulation für Sieg-Wahrscheinlichkeiten.
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
