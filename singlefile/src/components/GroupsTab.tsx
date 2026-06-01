import type { Tab } from "@/App";
import { useStore } from "@/store";
import { TEAMS } from "@lib/data/teams";
import type { GroupName } from "@lib/types/team";
import { AlgorithmBadge, EmptyResult, InfoBanner } from "./ui";

export function GroupsTab({ nav }: { nav: (t: Tab) => void }) {
  const result = useStore((s) => s.simulationResult);
  if (!result) return <EmptyResult nav={nav} />;
  const N = result.numSimulations;

  const groups: Record<GroupName, number[]> = {} as Record<GroupName, number[]>;
  TEAMS.forEach((t, i) => {
    if (!groups[t.group]) groups[t.group] = [];
    groups[t.group].push(i);
  });

  return (
    <section>
      <AlgorithmBadge algorithm={result.algorithm} />
      <InfoBanner icon="📊">
        <strong>Gruppensieger-Vorhersage.</strong> Pro Team siehst Du die Wahrscheinlichkeit für jede Position. Mintfarbene Zahl = P(Platz 1).
      </InfoBanner>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(Object.keys(groups) as GroupName[]).map((g) => {
          const rows = groups[g]
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
            <div key={g} className={`group-card ${hasGermany ? "germany-group" : ""}`}>
              <div className="group-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="group-letter">{g}</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Gruppe {g}</div>
                </div>
                <div style={{ textAlign: "right", fontSize: 10, color: "var(--text-tertiary)" }}>
                  🏅 Favorit
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                    {fav.team.flag} {fav.team.name}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {rows.map((r) => {
                  const quali = r.p1 + r.p2;
                  const isDFB = r.team.name === "Deutschland";
                  return (
                    <div key={r.idx} className={`group-team-row ${isDFB ? "is-germany" : ""}`}>
                      <div className="group-team-flag">{r.team.flag}</div>
                      <div className="group-team-info">
                        <div className="group-team-name">{r.team.name}</div>
                        <div className="group-bars">
                          <div className="b1" style={{ width: `${r.p1}%` }} />
                          <div className="b2" style={{ width: `${r.p2}%` }} />
                          <div className="b3" style={{ width: `${r.p3}%` }} />
                          <div className="b4" style={{ width: `${r.p4}%` }} />
                        </div>
                      </div>
                      <div className="group-pcts">
                        <div className="p1">{r.p1.toFixed(0)}%</div>
                        <div className="quali">Quali {quali.toFixed(0)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
