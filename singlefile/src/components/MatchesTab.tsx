import { useState } from "react";
import type { Tab } from "@/App";
import { useStore } from "@/store";
import { TEAMS } from "@lib/data/teams";
import { SCHEDULE } from "@lib/data/schedule";
import { LIVE_RESULTS } from "@lib/data/liveResults";
import { AlgorithmBadge, Button, InfoBanner } from "./ui";

type Filter = "all" | "germany" | { group: string };

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

// Ungenutzt jetzt, aber Tab-Parameter behalten für API-Kompatibilität
export function MatchesTab({ nav: _nav }: { nav: (t: Tab) => void }) {
  const result = useStore((s) => s.simulationResult);
  const [filter, setFilter] = useState<Filter>("all");
  const N = result?.numSimulations ?? 0;
  const finishedCount = Object.values(LIVE_RESULTS).filter((r) => r.isFinished).length;

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
      {result && <AlgorithmBadge algorithm={result.algorithm} />}
      <InfoBanner icon="⚽">
        <strong>Alle 72 Gruppenphasen-Spiele</strong> mit Datum, Anpfiff (MESZ), Stadion.{" "}
        {finishedCount > 0 && (
          <>
            <strong>{finishedCount}</strong> Spiel{finishedCount === 1 ? "" : "e"} live aktualisiert.{" "}
          </>
        )}
        {result
          ? "Mit Sieg-Wahrscheinlichkeiten aus der Simulation."
          : "Starte eine Simulation, um Sieg-Wahrscheinlichkeiten zu sehen."}
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
            const lr = LIVE_RESULTS[i];
            const ms = result?.matchStats[i];
            const winA = ms ? (ms.winA / N) * 100 : 0;
            const draw = ms ? (ms.draw / N) * 100 : 0;
            const winB = ms ? (ms.winB / N) * 100 : 0;
            const avgA = ms ? (ms.goalsA / N).toFixed(1) : "";
            const avgB = ms ? (ms.goalsB / N).toFixed(1) : "";
            const avgTotal = ms ? ((ms.goalsA + ms.goalsB) / N).toFixed(1) : "";
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
            const top = ms
              ? Object.entries(ms.scores)
                  .map(([k, v]) => ({ k, v }))
                  .sort((a, b) => b.v - a.v)
                  .slice(0, 6)
              : [];
            const tA = TEAMS[m.idxA!];
            const tB = TEAMS[m.idxB!];
            const isG = m.teamA === "Deutschland" || m.teamB === "Deutschland";
            let simHit: "✓" | "✗" | "" = "";
            if (lr?.isFinished && ms) {
              const actual = lr.goalsA > lr.goalsB ? "A" : lr.goalsA < lr.goalsB ? "B" : "X";
              const predicted = winA >= draw && winA >= winB ? "A" : winB > draw ? "B" : "X";
              simHit = predicted === actual ? "✓" : "✗";
            }
            return (
              <div
                key={i}
                className={`match-card ${isG ? "is-germany" : ""}`}
                style={lr?.isFinished ? { background: "rgba(94, 234, 212, 0.06)", border: "1px solid rgba(94, 234, 212, 0.25)" } : undefined}
              >
                <div className="match-meta">
                  <span>
                    {m.time} · Gruppe {m.group}
                    {lr?.isFinished && (
                      <span
                        style={{
                          marginLeft: 6, padding: "2px 6px", borderRadius: 999,
                          background: "var(--mint)", color: "var(--bg-deep)",
                          fontSize: 9, fontWeight: 800,
                        }}
                      >
                        ABGEPFIFFEN
                      </span>
                    )}
                  </span>
                  <span style={{ maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.venue}</span>
                </div>
                <div className="match-teams">
                  <div className="match-team">
                    <span style={{ fontSize: 18 }}>{tA.flag}</span>
                    <span className="match-team-name">{m.teamA}</span>
                  </div>
                  {lr?.isFinished ? (
                    <span style={{ fontSize: 18, fontWeight: 800, color: "var(--mint)", padding: "0 12px", fontVariantNumeric: "tabular-nums" }}>
                      {lr.goalsA}:{lr.goalsB}
                      {lr.winnerByPenalties && (
                        <span style={{ fontSize: 10, marginLeft: 4, color: "var(--text-tertiary)" }}>i.E.</span>
                      )}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", margin: "0 8px" }}>vs</span>
                  )}
                  <div className="match-team right">
                    <span className="match-team-name">{m.teamB}</span>
                    <span style={{ fontSize: 18 }}>{tB.flag}</span>
                  </div>
                </div>
                {ms ? (
                  <>
                    <div className="match-bars">
                      <div className="match-bar-a" style={{ width: `${winA}%` }} />
                      <div className="match-bar-x" style={{ width: `${draw}%` }} />
                      <div className="match-bar-b" style={{ width: `${winB}%` }} />
                    </div>
                    <div className="match-pcts">
                      <span>
                        1: {winA.toFixed(0)}%{" "}
                        {simHit && lr!.goalsA > lr!.goalsB && (
                          <span style={{ color: simHit === "✓" ? "var(--mint)" : "var(--orange)" }}>{simHit}</span>
                        )}
                      </span>
                      <span>
                        X: {draw.toFixed(0)}%{" "}
                        {simHit && lr!.goalsA === lr!.goalsB && (
                          <span style={{ color: simHit === "✓" ? "var(--mint)" : "var(--orange)" }}>{simHit}</span>
                        )}
                      </span>
                      <span>
                        2: {winB.toFixed(0)}%{" "}
                        {simHit && lr!.goalsA < lr!.goalsB && (
                          <span style={{ color: simHit === "✓" ? "var(--mint)" : "var(--orange)" }}>{simHit}</span>
                        )}
                      </span>
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
                  </>
                ) : (
                  !lr?.isFinished && (
                    <div style={{ fontSize: 11, fontStyle: "italic", marginTop: 4, color: "var(--text-tertiary)" }}>
                      Starte eine Simulation für Sieg-Wahrscheinlichkeiten.
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}
