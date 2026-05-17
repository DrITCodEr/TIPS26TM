"use client";

import { useSimulationStore } from "@/lib/stores/simulationStore";
import { TEAMS } from "@/lib/data/teams";
import type { GroupName } from "@/lib/types/team";
import { EmptyResult } from "./EmptyResult";
import { AlgorithmBadge } from "@/components/ui/AlgorithmBadge";
import { InfoBanner } from "@/components/ui/InfoBanner";

const POS_COLORS = [
  "var(--mint)", // P1
  "rgba(94, 234, 212, 0.55)", // P2
  "rgba(148, 163, 184, 0.7)", // P3
  "rgba(148, 163, 184, 0.35)", // P4
];

export function GroupPredictions() {
  const result = useSimulationStore((s) => s.simulationResult);
  if (!result) return <EmptyResult />;

  const N = result.numSimulations;

  // Gruppieren
  const groups: Record<GroupName, number[]> = {} as Record<GroupName, number[]>;
  TEAMS.forEach((t, i) => {
    if (!groups[t.group]) groups[t.group] = [];
    groups[t.group].push(i);
  });

  return (
    <>
      <AlgorithmBadge />
      <InfoBanner icon="📊">
        <strong>Gruppensieger-Vorhersage.</strong> Pro Team siehst Du die
        Wahrscheinlichkeit für jede Position. Die große mintfarbene Zahl =
        Platz 1.
      </InfoBanner>

      <div className="space-y-3">
        {Object.entries(groups).map(([g, idxs]) => {
          const rows = idxs
            .map((i) => {
              const rs = result.groupRankStats[i];
              return {
                idx: i,
                team: TEAMS[i],
                p1: (rs[0] / N) * 100,
                p2: (rs[1] / N) * 100,
                p3: (rs[2] / N) * 100,
                p4: (rs[3] / N) * 100,
              };
            })
            .sort((a, b) => b.p1 - a.p1);

          const fav = rows[0];
          const hasGermany = rows.some((r) => r.team.name === "Deutschland");

          return (
            <div
              key={g}
              className="rounded-2xl p-3.5"
              style={{
                background: "var(--bg-card)",
                border: hasGermany
                  ? "1px solid rgba(239, 68, 68, 0.3)"
                  : "1px solid var(--border-subtle)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-extrabold"
                    style={{ background: "var(--mint)", color: "var(--bg-deep)" }}
                  >
                    {g}
                  </div>
                  <div className="text-[14px] font-bold">Gruppe {g}</div>
                </div>
                <div
                  className="text-[10px] text-right leading-tight"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  🏅 Favorit
                  <div className="text-[12px] font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>
                    {fav.team.flag} {fav.team.name}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {rows.map((r) => {
                  const quali = r.p1 + r.p2;
                  return (
                    <div
                      key={r.idx}
                      className="flex items-center gap-2.5"
                      style={{
                        opacity: r.team.name === "Deutschland" ? 1 : 1,
                      }}
                    >
                      <div className="text-[18px] shrink-0 leading-none">
                        {r.team.flag}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[12px] font-bold truncate"
                          style={{
                            color:
                              r.team.name === "Deutschland"
                                ? "#fca5a5"
                                : "var(--text-primary)",
                          }}
                        >
                          {r.team.name}
                        </div>
                        <div
                          className="flex h-1.5 mt-1 rounded-full overflow-hidden"
                          style={{ background: "var(--bg-tertiary)" }}
                        >
                          {[r.p1, r.p2, r.p3, r.p4].map((p, idx) => (
                            <div
                              key={idx}
                              style={{
                                width: `${p}%`,
                                background: POS_COLORS[idx],
                                transition: "width 0.3s ease",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0 w-14">
                        <div
                          className="text-[13px] font-extrabold tabular-nums"
                          style={{ color: "var(--mint)" }}
                        >
                          {r.p1.toFixed(0)}%
                        </div>
                        <div
                          className="text-[9px]"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          Quali {quali.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                className="flex gap-3 mt-3 pt-2.5 text-[9px] font-semibold uppercase tracking-wider"
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  color: "var(--text-tertiary)",
                }}
              >
                {["Platz 1", "Platz 2", "Platz 3", "Platz 4"].map((lbl, i) => (
                  <span key={lbl} className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: POS_COLORS[i] }}
                    />
                    {lbl}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
