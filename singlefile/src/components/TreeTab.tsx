import { useMemo, useState } from "react";
import { useStore } from "@/store";
import { TEAMS } from "@lib/data/teams";
import { SCHEDULE } from "@lib/data/schedule";
import { computeLiveStandings } from "@lib/algorithms/liveStandings";
import { deriveLiveBracket } from "@lib/algorithms/liveBracket";
import { slotLabel } from "@lib/algorithms/fifaBracket";
import { R16_ROUND, QF_ROUND, SF_ROUND } from "@lib/data/koBracket";
import type { LiveMatchResult } from "@lib/data/liveResults";
import type { GroupName } from "@lib/types/team";
import { useT, formatScheduleDate, type TranslationDict } from "@/i18n";
import { Card, InfoBanner, SectionTitle } from "./ui";

const GROUPS: GroupName[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

// 3-Letter-Code aus dem Team-Namen (für kompakte Bracket-Karten)
function teamCode(name: string): string {
  return name.substring(0, 3).toUpperCase();
}

// ============================================================
// Bracket-Tree-Daten: alle 5 Runden vorbereiten
// ============================================================

interface BracketSlotView {
  teamIdx: number | null;
  label: string;
}

interface BracketMatchView {
  matchNo: number;
  a: BracketSlotView;
  b: BracketSlotView;
}

interface BracketRoundView {
  id: "r32" | "r16" | "qf" | "sf" | "final";
  title: string;
  short: string;
  matches: BracketMatchView[];
}

function buildBracketRounds(
  liveStandings: ReturnType<typeof computeLiveStandings>,
  t: TranslationDict,
): BracketRoundView[] {
  const r32 = deriveLiveBracket(liveStandings);
  const r32Matches: BracketMatchView[] = r32.map((m) => ({
    matchNo: m.matchNo,
    a: { teamIdx: m.a.resolvedTeamIdx, label: slotLabel(m.a.slot) },
    b: { teamIdx: m.b.resolvedTeamIdx, label: slotLabel(m.b.slot) },
  }));

  const r16Matches: BracketMatchView[] = R16_ROUND.feeders.map(
    ([a, b], i) => ({
      matchNo: i + 1,
      a: { teamIdx: null, label: t.tree.winnerOfR32(a + 1) },
      b: { teamIdx: null, label: t.tree.winnerOfR32(b + 1) },
    }),
  );

  const qfMatches: BracketMatchView[] = QF_ROUND.feeders.map(([a, b], i) => ({
    matchNo: i + 1,
    a: { teamIdx: null, label: t.tree.winnerOfR16(a + 1) },
    b: { teamIdx: null, label: t.tree.winnerOfR16(b + 1) },
  }));

  const sfMatches: BracketMatchView[] = SF_ROUND.feeders.map(([a, b], i) => ({
    matchNo: i + 1,
    a: { teamIdx: null, label: t.tree.winnerOfQF(a + 1) },
    b: { teamIdx: null, label: t.tree.winnerOfQF(b + 1) },
  }));

  const finalMatches: BracketMatchView[] = [
    {
      matchNo: 1,
      a: { teamIdx: null, label: t.tree.winnerOfSF(1) },
      b: { teamIdx: null, label: t.tree.winnerOfSF(2) },
    },
  ];

  return [
    { id: "r32", title: t.tree.roundR32, short: t.tree.roundR32Short, matches: r32Matches },
    { id: "r16", title: t.tree.roundR16, short: t.tree.roundR16Short, matches: r16Matches },
    { id: "qf", title: t.tree.roundQF, short: t.tree.roundQFShort, matches: qfMatches },
    { id: "sf", title: t.tree.roundSF, short: t.tree.roundSFShort, matches: sfMatches },
    { id: "final", title: t.tree.roundFinal, short: t.tree.roundFinalShort, matches: finalMatches },
  ];
}

// ============================================================
// Compact Match-Card für den Tree
// ============================================================

function TreeMatchCard({ match, teamName }: { match: BracketMatchView; teamName: (key: string) => string }) {
  const renderSide = (slot: BracketSlotView) => {
    if (slot.teamIdx !== null) {
      const team = TEAMS[slot.teamIdx];
      const isDfb = team.name === "Deutschland";
      return (
        <div
          title={teamName(team.name)}
          style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700, color: isDfb ? "#fca5a5" : "var(--text-primary)" }}
        >
          <span style={{ fontSize: 14 }}>{team.flag}</span>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.3 }}>{teamCode(team.name)}</span>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-tertiary)", fontSize: 10, fontWeight: 600 }}>
        <span>{slot.label}</span>
      </div>
    );
  };
  return (
    <div
      style={{
        width: "100%",
        padding: "6px 8px",
        borderRadius: 8,
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {renderSide(match.a)}
      <div style={{ height: 1, background: "var(--border-subtle)" }} />
      {renderSide(match.b)}
    </div>
  );
}

// ============================================================
// Horizontal-scrollender K.o.-Bracket-Tree
// ============================================================

function KoBracketTree({ rounds, teamName, scrollHint }: { rounds: BracketRoundView[]; teamName: (key: string) => string; scrollHint: string }) {
  // Fixe Höhe: R32 hat 16 Matches → 16 × Slot-Höhe
  const ROW_H = 56;
  const TOTAL_H = ROW_H * 16;
  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          overflowY: "hidden",
          padding: "8px 0 12px",
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x proximity",
        }}
      >
        {rounds.map((round) => (
          <div
            key={round.id}
            style={{
              flexShrink: 0,
              width: 132,
              display: "flex",
              flexDirection: "column",
              scrollSnapAlign: "start",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "var(--mint)",
                textAlign: "center",
                padding: "4px 0",
                marginBottom: 4,
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              {round.short}
            </div>
            <div style={{ height: TOTAL_H, display: "flex", flexDirection: "column" }}>
              {round.matches.map((m) => (
                <div
                  key={m.matchNo}
                  style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 2px" }}
                >
                  <TreeMatchCard match={m} teamName={teamName} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: "var(--text-tertiary)", textAlign: "center", padding: "0 4px 4px" }}>
        {scrollHint}
      </div>
    </>
  );
}

// ============================================================
// Gruppe (aufklappbar): Matches + Tabelle
// ============================================================

function GroupAccordion({
  group,
  liveResults,
  standings,
  teamName,
  t,
  locale,
  defaultOpen,
}: {
  group: GroupName;
  liveResults: Record<number, LiveMatchResult>;
  standings: ReturnType<typeof computeLiveStandings>;
  teamName: (key: string) => string;
  t: TranslationDict;
  locale: "de" | "en";
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const matches = useMemo(
    () => SCHEDULE.map((m, i) => ({ m, i })).filter(({ m }) => m.group === group),
    [group],
  );
  const finishedCount = matches.filter(({ i }) => liveResults[i]?.isFinished).length;
  const rows = standings[group] ?? [];
  const hasDfb = rows.some((r) => r.teamName === "Deutschland");

  return (
    <div
      style={{
        borderRadius: 14,
        background: "var(--bg-card)",
        border: hasDfb ? "1px solid rgba(239,68,68,0.3)" : "1px solid var(--border-subtle)",
        overflow: "hidden",
        marginBottom: 8,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: hasDfb ? "rgba(239,68,68,0.18)" : "var(--bg-tertiary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800,
              color: hasDfb ? "#fca5a5" : "var(--mint)",
            }}
          >
            {group}
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{t.tree.groupCardLabel(group)}</div>
            <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
              {t.tree.matchCount(finishedCount, matches.length)}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {rows.slice(0, 4).map((r) => (
              <span key={r.teamIdx} style={{ fontSize: 14 }} title={teamName(r.teamName)}>
                {r.flag}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 14, color: "var(--text-tertiary)", transition: "transform 0.15s ease", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>
            ▶
          </span>
        </div>
      </button>
      {open && (
        <div style={{ padding: "0 12px 12px", borderTop: "1px solid var(--border-subtle)" }}>
          {/* Tabelle */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "20px 1fr 30px 30px 30px", gap: 6, fontSize: 9, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              <span>#</span>
              <span>{t.tree.standingsHeader}</span>
              <span style={{ textAlign: "center" }}>{t.tree.standingsSp}</span>
              <span style={{ textAlign: "center" }}>{t.tree.standingsTd}</span>
              <span style={{ textAlign: "center" }}>{t.tree.standingsPkt}</span>
            </div>
            {rows.map((r, i) => {
              const isDfb = r.teamName === "Deutschland";
              const quali = i < 2;
              return (
                <div
                  key={r.teamIdx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "20px 1fr 30px 30px 30px",
                    gap: 6,
                    alignItems: "center",
                    padding: "4px 0",
                    fontSize: 11,
                    fontWeight: isDfb ? 800 : 600,
                    color: isDfb ? "#fca5a5" : quali ? "var(--text-primary)" : "var(--text-secondary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  <span style={{ fontWeight: 800, color: quali ? "var(--mint)" : "var(--text-tertiary)" }}>{i + 1}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                    <span style={{ fontSize: 14 }}>{r.flag}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{teamName(r.teamName)}</span>
                  </span>
                  <span style={{ textAlign: "center" }}>{r.spiele}</span>
                  <span style={{ textAlign: "center" }}>{r.td > 0 ? `+${r.td}` : r.td}</span>
                  <span style={{ textAlign: "center", fontWeight: 800, color: quali ? "var(--mint)" : "var(--text-secondary)" }}>{r.pkt}</span>
                </div>
              );
            })}
          </div>

          {/* Matches */}
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            {matches.map(({ m, i }) => {
              const lr = liveResults[i];
              const isFin = lr?.isFinished === true;
              const isDfbMatch = m.teamA === "Deutschland" || m.teamB === "Deutschland";
              return (
                <div
                  key={i}
                  style={{
                    padding: "6px 8px",
                    borderRadius: 8,
                    background: isFin ? "rgba(94,234,212,0.05)" : "var(--bg-tertiary)",
                    border: isFin
                      ? "1px solid rgba(94,234,212,0.2)"
                      : isDfbMatch
                        ? "1px solid rgba(239,68,68,0.25)"
                        : "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 11,
                    gap: 8,
                  }}
                >
                  <span style={{ color: "var(--text-tertiary)", fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                    {formatScheduleDate(m.date, locale)} · {m.time}
                  </span>
                  <span style={{ flex: 1, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
                    {TEAMS[m.idxA!].flag} {teamCode(m.teamA)}
                    {" "}
                    {isFin ? (
                      <strong style={{ color: "var(--mint)" }}>{lr.goalsA}:{lr.goalsB}</strong>
                    ) : (
                      <span style={{ color: "var(--text-tertiary)" }}>vs</span>
                    )}
                    {" "}
                    {teamCode(m.teamB)} {TEAMS[m.idxB!].flag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TreeTab (Main)
// ============================================================

export function TreeTab() {
  const liveResults = useStore((s) => s.liveResults);
  const { t, locale, teamName } = useT();

  const liveAsResult = useMemo<Record<number, LiveMatchResult>>(() => {
    const out: Record<number, LiveMatchResult> = {};
    for (const k of Object.keys(liveResults)) {
      const idx = Number(k);
      const lr = liveResults[idx];
      if (!lr.completed) continue;
      out[idx] = { goalsA: lr.scoreA, goalsB: lr.scoreB, isFinished: true };
    }
    return out;
  }, [liveResults]);

  const standings = useMemo(
    () => computeLiveStandings(liveAsResult, SCHEDULE, TEAMS),
    [liveAsResult],
  );
  const rounds = useMemo(() => buildBracketRounds(standings, t), [standings, t]);

  return (
    <section>
      <InfoBanner icon="🌳">
        <strong>{t.tree.pageTitle}</strong> — {t.tree.pageLead}
      </InfoBanner>

      <SectionTitle>{t.tree.koPhaseTitle}</SectionTitle>
      <Card style={{ padding: 8 }}>
        <KoBracketTree rounds={rounds} teamName={teamName} scrollHint={t.tree.scrollHint} />
      </Card>

      <SectionTitle>{t.tree.groupStageTitle}</SectionTitle>
      {GROUPS.map((g) => (
        <GroupAccordion
          key={g}
          group={g}
          liveResults={liveAsResult}
          standings={standings}
          teamName={teamName}
          t={t}
          locale={locale}
          defaultOpen={g === "E"}
        />
      ))}
    </section>
  );
}
