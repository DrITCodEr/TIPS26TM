import { useState } from "react";
import type { Tab } from "@/App";
import { useStore } from "@/store";
import { TEAMS } from "@lib/data/teams";
import { SCHEDULE } from "@lib/data/schedule";
import { useT, formatScheduleDate } from "@/i18n";
import { AlgorithmBadge, Button, InfoBanner } from "./ui";

type Filter = "all" | "germany" | { group: string };

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export function MatchesTab({ nav: _nav }: { nav: (tab: Tab) => void }) {
  const result = useStore((s) => s.simulationResult);
  const liveResults = useStore((s) => s.liveResults);
  const liveFetchedAt = useStore((s) => s.liveFetchedAt);
  const liveError = useStore((s) => s.liveError);
  const [filter, setFilter] = useState<Filter>("all");
  const { t, locale, teamName } = useT();
  const N = result?.numSimulations ?? 0;
  const finishedCount = Object.values(liveResults).filter((r) => r.completed).length;
  const liveCount = Object.values(liveResults).filter((r) => !r.completed).length;

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
      <LiveStatusBanner
        liveFetchedAt={liveFetchedAt}
        liveError={liveError}
        liveCount={liveCount}
        finishedCount={finishedCount}
      />
      <InfoBanner icon="⚽">
        <strong>{t.matches.bannerStrong}</strong> {t.matches.bannerText}{" "}
        {result ? t.matches.bannerWithSim : t.matches.bannerNoSim}
      </InfoBanner>

      <div className="filter-row">
        <Button active={isActive("all")} onClick={() => setFilter("all")}>{t.matches.filterAll}</Button>
        <Button active={isActive("germany")} onClick={() => setFilter("germany")}>{t.matches.filterDfb}</Button>
        {GROUPS.map((g) => (
          <Button key={g} active={isActive({ group: g })} onClick={() => setFilter({ group: g })}>
            {g}
          </Button>
        ))}
      </div>

      {Object.entries(byDate).map(([date, matches]) => (
        <div key={date}>
          <div className="match-date-header">{formatScheduleDate(date, locale)}</div>
          {matches.map(({ m, i }) => {
            const lr = liveResults[i];
            const isLive = lr && !lr.completed;
            const isFinished = lr?.completed === true;
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
            if (isFinished && ms) {
              const actual = lr!.scoreA > lr!.scoreB ? "A" : lr!.scoreA < lr!.scoreB ? "B" : "X";
              const predicted = winA >= draw && winA >= winB ? "A" : winB > draw ? "B" : "X";
              simHit = predicted === actual ? "✓" : "✗";
            }
            // Karte tönt sich nach Tipp-Ergebnis: grün = getroffen, orange = verfehlt
            const cardStyle = isFinished
              ? simHit === "✓"
                ? { background: "rgba(94, 234, 212, 0.08)", border: "1px solid rgba(94, 234, 212, 0.45)" }
                : simHit === "✗"
                  ? { background: "rgba(249, 115, 22, 0.07)", border: "1px solid rgba(249, 115, 22, 0.45)" }
                  : { background: "rgba(94, 234, 212, 0.06)", border: "1px solid rgba(94, 234, 212, 0.25)" }
              : isLive
                ? { background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.3)" }
                : undefined;
            return (
              <div key={i} className={`match-card ${isG ? "is-germany" : ""}`} style={cardStyle}>
                <div className="match-meta">
                  <span>
                    {m.time} · {t.matches.groupPrefix} {m.group}
                    {isFinished && (
                      <span style={{ marginLeft: 6, padding: "2px 6px", borderRadius: 999, background: "var(--mint)", color: "var(--bg-deep)", fontSize: 9, fontWeight: 800 }}>
                        {t.matches.pillFinished}
                      </span>
                    )}
                    {isLive && (
                      <span style={{ marginLeft: 6, padding: "2px 6px", borderRadius: 999, background: "var(--germany-red)", color: "#fff", fontSize: 9, fontWeight: 800 }}>
                        {t.matches.pillLive} {lr!.clock}
                      </span>
                    )}
                    {simHit === "✓" && (
                      <span
                        title={t.matches.tippTooltipCorrect}
                        style={{
                          marginLeft: 6, padding: "2px 7px", borderRadius: 999,
                          background: "var(--mint)", color: "var(--bg-deep)",
                          fontSize: 9, fontWeight: 800,
                          boxShadow: "0 0 6px rgba(94, 234, 212, 0.5)",
                        }}
                      >
                        {t.matches.tippCorrect}
                      </span>
                    )}
                    {simHit === "✗" && (
                      <span
                        title={t.matches.tippTooltipWrong}
                        style={{
                          marginLeft: 6, padding: "2px 7px", borderRadius: 999,
                          background: "var(--orange)", color: "#fff",
                          fontSize: 9, fontWeight: 800,
                          boxShadow: "0 0 6px rgba(249, 115, 22, 0.5)",
                        }}
                      >
                        {t.matches.tippWrong}
                      </span>
                    )}
                  </span>
                  <span style={{ maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.venue}</span>
                </div>
                <div className="match-teams">
                  <div className="match-team">
                    <span style={{ fontSize: 18 }}>{tA.flag}</span>
                    <span className="match-team-name">{teamName(m.teamA)}</span>
                  </div>
                  {lr ? (
                    <span style={{ fontSize: 18, fontWeight: 800, color: isFinished ? "var(--mint)" : "#fca5a5", padding: "0 12px", fontVariantNumeric: "tabular-nums" }}>
                      {lr.scoreA}:{lr.scoreB}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", margin: "0 8px" }}>vs</span>
                  )}
                  <div className="match-team right">
                    <span className="match-team-name">{teamName(m.teamB)}</span>
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
                        {simHit && lr!.scoreA > lr!.scoreB && (
                          <span style={{ color: simHit === "✓" ? "var(--mint)" : "var(--orange)" }}>{simHit}</span>
                        )}
                      </span>
                      <span>
                        X: {draw.toFixed(0)}%{" "}
                        {simHit && lr!.scoreA === lr!.scoreB && (
                          <span style={{ color: simHit === "✓" ? "var(--mint)" : "var(--orange)" }}>{simHit}</span>
                        )}
                      </span>
                      <span>
                        2: {winB.toFixed(0)}%{" "}
                        {simHit && lr!.scoreA < lr!.scoreB && (
                          <span style={{ color: simHit === "✓" ? "var(--mint)" : "var(--orange)" }}>{simHit}</span>
                        )}
                      </span>
                    </div>
                    <div className="match-footer">
                      <span>
                        ⌀{" "}
                        <strong style={{ color: "var(--text-primary)" }}>{avgA}:{avgB}</strong>
                        {" "}({avgTotal} {t.matches.avgGoals}) ·{" "}
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
                  !isFinished &&
                  !isLive && (
                    <div style={{ fontSize: 11, fontStyle: "italic", marginTop: 4, color: "var(--text-tertiary)" }}>
                      {t.matches.promptForSim}
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

function LiveStatusBanner({
  liveFetchedAt,
  liveError,
  liveCount,
  finishedCount,
}: {
  liveFetchedAt: number | null;
  liveError: string | null;
  liveCount: number;
  finishedCount: number;
}) {
  const { t } = useT();
  if (liveFetchedAt) {
    const d = new Date(liveFetchedAt);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const total = liveCount + finishedCount;
    return (
      <div
        style={{
          fontSize: 11, fontWeight: 600, padding: "8px 12px", borderRadius: 10,
          marginBottom: 10, background: "rgba(239, 68, 68, 0.07)",
          border: "1px solid rgba(239, 68, 68, 0.2)", color: "var(--text-secondary)",
        }}
      >
        {t.matches.liveActive} · {t.matches.liveCount(total)}
        {liveCount > 0 && <> · {t.matches.liveRunning(liveCount)}</>}
        {" · "}{t.matches.liveAsOf} {hh}:{mm}
      </div>
    );
  }
  if (liveError === "file-context") {
    return (
      <div
        style={{
          fontSize: 11, fontWeight: 600, padding: "8px 12px", borderRadius: 10,
          marginBottom: 10, background: "var(--bg-tertiary)",
          border: "1px solid var(--border-subtle)", color: "var(--text-tertiary)",
        }}
      >
        ⚠️ <strong>{t.matches.liveFileContext}</strong>{" "}
        {t.matches.liveFileContextDetail}
      </div>
    );
  }
  if (liveError) {
    return (
      <div
        style={{
          fontSize: 11, fontWeight: 600, padding: "8px 12px", borderRadius: 10,
          marginBottom: 10, background: "var(--bg-tertiary)",
          border: "1px solid var(--border-subtle)", color: "var(--text-tertiary)",
        }}
      >
        ⚠️ {t.matches.liveError} ({liveError}). {t.matches.liveRetryHint}
      </div>
    );
  }
  return null;
}
