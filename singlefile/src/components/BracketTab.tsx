import type { Tab } from "@/App";
import { useStore } from "@/store";
import { TEAMS, TEAM_IDX_BY_NAME } from "@lib/data/teams";
import { SCHEDULE } from "@lib/data/schedule";
import { computeLiveStandings } from "@lib/algorithms/liveStandings";
import { deriveLiveBracket } from "@lib/algorithms/liveBracket";
import { slotLabel } from "@lib/algorithms/fifaBracket";
import type { LiveMatchResult } from "@lib/data/liveResults";
import { useT } from "@/i18n";
import { Card, InfoBanner, SectionTitle } from "./ui";

export function BracketTab({ onBack }: { onBack: (t: Tab) => void }) {
  const liveState = useStore((s) => s.liveResults);
  const liveKo = useStore((s) => s.liveKo);
  const liveFetchedAt = useStore((s) => s.liveFetchedAt);
  const { t, locale, teamName } = useT();

  const liveAsResult: Record<number, LiveMatchResult> = {};
  for (const k of Object.keys(liveState)) {
    const idx = Number(k);
    const lr = liveState[idx];
    if (!lr.completed) continue;
    liveAsResult[idx] = {
      goalsA: lr.scoreA,
      goalsB: lr.scoreB,
      isFinished: true,
    };
  }

  const standings = computeLiveStandings(liveAsResult, SCHEDULE, TEAMS);
  const bracket = deriveLiveBracket(standings);
  // Echte R32-Paarungen aus dem ESPN-Feed haben Vorrang vor der Ableitung
  const realR32 = liveKo.filter((k) => k.round === "r32");
  const allFinished =
    realR32.length > 0 || bracket.every((m) => m.a.resolvedTeamIdx !== null);
  const finishedCount = Object.keys(liveAsResult).length;

  return (
    <section>
      <InfoBanner icon="🏆">
        <strong>{t.bracket.bannerStrong}</strong>{" "}
        {allFinished ? t.bracket.bannerAllDone : t.bracket.bannerProgress(finishedCount)}
      </InfoBanner>

      {liveFetchedAt && (
        <div style={{ fontSize: 10, marginBottom: 12, padding: "0 4px", color: "var(--text-tertiary)" }}>
          {t.bracket.lastUpdate}{" "}
          {new Date(liveFetchedAt).toLocaleTimeString(locale === "de" ? "de-DE" : "en-US")}
        </div>
      )}

      <SectionTitle>{t.bracket.r32Title}</SectionTitle>
      {realR32.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {realR32.map((k, i) => {
            const idxA = TEAM_IDX_BY_NAME[k.teamA];
            const idxB = TEAM_IDX_BY_NAME[k.teamB];
            const nameA = idxA != null ? teamName(k.teamA) : k.teamA;
            const nameB = idxB != null ? teamName(k.teamB) : k.teamB;
            const hasScore = k.state !== "pre";
            const winnerA = k.winner === "A";
            const winnerB = k.winner === "B";
            return (
              <Card key={`${k.teamA}-${k.teamB}-${i}`}>
                <div style={{ fontSize: 10, marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-tertiary)", display: "flex", justifyContent: "space-between" }}>
                  <span>{t.bracket.r32Match} {i + 1}</span>
                  {k.state === "in" && (
                    <span style={{ color: "var(--germany-red)" }}>🔴 {k.clock}</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0, opacity: winnerB ? 0.55 : 1 }}>
                    {idxA != null && <span style={{ fontSize: 18 }}>{TEAMS[idxA].flag}</span>}
                    <span style={{ fontSize: 13, fontWeight: winnerA ? 800 : 700, color: winnerA ? "var(--mint)" : "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {nameA}
                    </span>
                  </div>
                  {hasScore ? (
                    <span style={{ fontSize: 15, fontWeight: 800, fontVariantNumeric: "tabular-nums", flexShrink: 0, color: k.completed ? "var(--mint)" : "#fca5a5" }}>
                      {k.scoreA}:{k.scoreB}
                      {k.penA != null && k.penB != null && (
                        <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 700 }}>
                          {" "}({k.penA}:{k.penB} {t.tree.penShort})
                        </span>
                      )}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", flexShrink: 0 }}>{t.bracket.vs}</span>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0, justifyContent: "flex-end", opacity: winnerA ? 0.55 : 1 }}>
                    <span style={{ fontSize: 13, fontWeight: winnerB ? 800 : 700, color: winnerB ? "var(--mint)" : "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>
                      {nameB}
                    </span>
                    {idxB != null && <span style={{ fontSize: 18 }}>{TEAMS[idxB].flag}</span>}
                  </div>
                </div>
                {k.venue && (
                  <div style={{ fontSize: 9, marginTop: 6, color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {k.venue}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {bracket.map((m) => {
          const a = m.a;
          const b = m.b;
          const teamA = a.resolvedTeamIdx !== null ? TEAMS[a.resolvedTeamIdx] : null;
          const teamB = b.resolvedTeamIdx !== null ? TEAMS[b.resolvedTeamIdx] : null;
          return (
            <Card key={m.matchNo}>
              <div style={{ fontSize: 10, marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-tertiary)" }}>
                {t.bracket.r32Match} {m.matchNo}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                  {teamA && <span style={{ fontSize: 18 }}>{teamA.flag}</span>}
                  <div style={{ minWidth: 0 }}>
                    {teamA ? (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{teamName(teamA.name)}</div>
                        <div style={{ fontSize: 9, color: "var(--text-tertiary)" }}>{slotLabel(a.slot)}</div>
                      </>
                    ) : (
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{slotLabel(a.slot)}</div>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, margin: "0 8px", color: "var(--text-tertiary)" }}>{t.bracket.vs}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0, justifyContent: "flex-end" }}>
                  <div style={{ minWidth: 0, textAlign: "right" }}>
                    {teamB ? (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{teamName(teamB.name)}</div>
                        <div style={{ fontSize: 9, color: "var(--text-tertiary)" }}>{slotLabel(b.slot)}</div>
                      </>
                    ) : (
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{slotLabel(b.slot)}</div>
                    )}
                  </div>
                  {teamB && <span style={{ fontSize: 18 }}>{teamB.flag}</span>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      )}

      <SectionTitle>{t.bracket.datesTitle}</SectionTitle>
      <Card>
        <div style={{ display: "grid", gap: 8, fontSize: 12 }}>
          {[
            [t.bracket.dateR32, t.bracket.dateR32V],
            [t.bracket.dateR16, t.bracket.dateR16V],
            [t.bracket.dateQF, t.bracket.dateQFV],
            [t.bracket.dateSF, t.bracket.dateSFV],
            [t.bracket.date3rd, t.bracket.date3rdV],
            [t.bracket.dateFinal, t.bracket.dateFinalV],
          ].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>{l}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <span
          style={{ fontSize: 11, fontWeight: 700, color: "var(--mint)", textDecoration: "underline", cursor: "pointer" }}
          onClick={() => onBack("home")}
        >
          {t.bracket.back}
        </span>
      </div>
    </section>
  );
}
