import { useState } from "react";
import type { Tab } from "@/App";
import { useStore } from "@/store";
import { TEAMS } from "@lib/data/teams";
import { SCHEDULE } from "@lib/data/schedule";
import { AlgorithmBadge, Button, EmptyResult, InfoBanner } from "./ui";

type Filter = "all" | "germany" | { group: string };

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export function MatchesTab({ nav }: { nav: (t: Tab) => void }) {
  const result = useStore((s) => s.simulationResult);
  const [filter, setFilter] = useState<Filter>("all");
  if (!result) return <EmptyResult nav={nav} />;
  const N = result.numSimulations;

  const filtered = SCHEDULE.map((m, i) => ({ m, i })).filter(({ m }) => {
    if (filter === "all") return true;
    if (filter === "germany") return m.teamA === "Deutschland" || m.teamB === "Deutschland";
    return m.group === filter.group;
  });

  const byDate: Record<string, { m: typeof SCHEDULE[number]; i: number }[]> = {};
  for (const e of filtered) {
    if (!byDate[e.m.date]) byDate[e.m.date] = [];
    byDate[e.m.date].push(e);
  }

  const isActive = (opt: Filter): boolean => {
    if (opt === "all" && filter === "all") return true;
    if (opt === "germany" && filter === "germany") return true;
    if (typeof opt === "object" && typeof filter === "object") return opt.group === filter.group;
    return false;
  };

  return (
    <section>
      <AlgorithmBadge algorithm={result.algorithm} />
      <InfoBanner icon="⚽">
        <strong>Alle 72 Gruppenphasen-Spiele</strong> mit MESZ-Zeiten, Stadien und Sieg-Wahrscheinlichkeiten.
      </InfoBanner>

      <div className="filter-row">
        <Button active={isActive("all")} onClick={() => setFilter("all")}>Alle</Button>
        <Button active={isActive("germany")} onClick={() => setFilter("germany")}>🇩🇪 DFB</Button>
        {GROUPS.map((g) => (
          <Button key={g} active={isActive({ group: g })} onClick={() => setFilter({ group: g })}>
            {g}
          </Button>
        ))}
      </div>

      {Object.entries(byDate).map(([date, matches]) => (
        <div key={date}>
          <div className="match-date-header">{date}</div>
          {matches.map(({ m, i }) => {
            const ms = result.matchStats[i];
            const winA = (ms.winA / N) * 100;
            const draw = (ms.draw / N) * 100;
            const winB = (ms.winB / N) * 100;
            const avgA = (ms.goalsA / N).toFixed(1);
            const avgB = (ms.goalsB / N).toFixed(1);
            const avgTotal = ((ms.goalsA + ms.goalsB) / N).toFixed(1);
            let countGe4 = 0;
            let countGe6 = 0;
            for (const k of Object.keys(ms.scores)) {
              const [ga, gb] = k.split("-").map(Number);
              const tot = ga + gb;
              const c = ms.scores[k];
              if (tot >= 4) countGe4 += c;
              if (tot >= 6) countGe6 += c;
            }
            const pctGe4 = ((countGe4 / N) * 100).toFixed(0);
            const pctGe6 = ((countGe6 / N) * 100).toFixed(0);
            const top = Object.entries(ms.scores).map(([k, v]) => ({ k, v })).sort((a, b) => b.v - a.v).slice(0, 6);
            const tA = TEAMS[m.idxA!];
            const tB = TEAMS[m.idxB!];
            const isG = m.teamA === "Deutschland" || m.teamB === "Deutschland";
            return (
              <div key={i} className={`match-card ${isG ? "is-germany" : ""}`}>
                <div className="match-meta">
                  <span>{m.time} · Gruppe {m.group}</span>
                  <span style={{ maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.venue}</span>
                </div>
                <div className="match-teams">
                  <div className="match-team">
                    <span style={{ fontSize: 18 }}>{tA.flag}</span>
                    <span className="match-team-name">{m.teamA}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", margin: "0 8px" }}>vs</span>
                  <div className="match-team right">
                    <span className="match-team-name">{m.teamB}</span>
                    <span style={{ fontSize: 18 }}>{tB.flag}</span>
                  </div>
                </div>
                <div className="match-bars">
                  <div className="match-bar-a" style={{ width: `${winA}%` }} />
                  <div className="match-bar-x" style={{ width: `${draw}%` }} />
                  <div className="match-bar-b" style={{ width: `${winB}%` }} />
                </div>
                <div className="match-pcts">
                  <span>1: {winA.toFixed(0)}%</span>
                  <span>X: {draw.toFixed(0)}%</span>
                  <span>2: {winB.toFixed(0)}%</span>
                </div>
                <div className="match-footer">
                  <span>
                    ⌀{" "}
                    <strong style={{ color: "var(--text-primary)" }}>{avgA}:{avgB}</strong>
                    {" "}({avgTotal} Tore) ·{" "}
                    <span style={{ color: "var(--mint)" }}>≥4: {pctGe4}%</span>
                    {Number(pctGe6) > 0 && (
                      <>
                        {" · "}
                        <span style={{ color: "var(--mint)" }}>≥6: {pctGe6}%</span>
                      </>
                    )}
                  </span>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {top.map((t) => (
                      <span key={t.k} className="score-pill">
                        {t.k} · {((t.v / N) * 100).toFixed(0)}%
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}
