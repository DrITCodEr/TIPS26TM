import type { Tab } from "@/App";
import { useStore } from "@/store";
import { TEAMS } from "@lib/data/teams";
import { SCHEDULE } from "@lib/data/schedule";
import { computeLiveStandings } from "@lib/algorithms/liveStandings";
import { deriveLiveBracket } from "@lib/algorithms/liveBracket";
import { slotLabel } from "@lib/algorithms/fifaBracket";
import type { LiveMatchResult } from "@lib/data/liveResults";
import { Card, InfoBanner, SectionTitle } from "./ui";

export function BracketTab({ onBack }: { onBack: (t: Tab) => void }) {
  const liveState = useStore((s) => s.liveResults);
  const liveFetchedAt = useStore((s) => s.liveFetchedAt);

  // Adapter: ESPN-LiveMatchState → unsere LiveMatchResult (für Standings + Bracket)
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
  const allFinished = bracket.every((m) => m.a.resolvedTeamIdx !== null);
  const finishedCount = Object.keys(liveAsResult).length;

  return (
    <section>
      <InfoBanner icon="🏆">
        <strong>K.o.-Bracket nach FIFA-Schema.</strong>{" "}
        {allFinished
          ? "Alle Gruppenspiele abgeschlossen — die R32-Paarungen sind final."
          : `Slot-Labels gemäß offizieller FIFA-Tabelle. ${finishedCount} / 72 Gruppenspielen aktualisiert. Sobald die Gruppenphase fertig ist, fülle ich die Slots automatisch.`}
      </InfoBanner>

      {liveFetchedAt && (
        <div style={{ fontSize: 10, marginBottom: 12, padding: "0 4px", color: "var(--text-tertiary)" }}>
          Live-Daten zuletzt aktualisiert:{" "}
          {new Date(liveFetchedAt).toLocaleTimeString("de-DE")}
        </div>
      )}

      <SectionTitle>🎯 Sechzehntelfinale (R32)</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {bracket.map((m) => {
          const a = m.a;
          const b = m.b;
          const teamA = a.resolvedTeamIdx !== null ? TEAMS[a.resolvedTeamIdx] : null;
          const teamB = b.resolvedTeamIdx !== null ? TEAMS[b.resolvedTeamIdx] : null;
          return (
            <Card key={m.matchNo}>
              <div style={{ fontSize: 10, marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-tertiary)" }}>
                R32 · Match {m.matchNo}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                  {teamA && <span style={{ fontSize: 18 }}>{teamA.flag}</span>}
                  <div style={{ minWidth: 0 }}>
                    {teamA ? (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{teamA.name}</div>
                        <div style={{ fontSize: 9, color: "var(--text-tertiary)" }}>{slotLabel(a.slot)}</div>
                      </>
                    ) : (
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{slotLabel(a.slot)}</div>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, margin: "0 8px", color: "var(--text-tertiary)" }}>vs</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0, justifyContent: "flex-end" }}>
                  <div style={{ minWidth: 0, textAlign: "right" }}>
                    {teamB ? (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{teamB.name}</div>
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

      <SectionTitle>📅 Bracket-Termine</SectionTitle>
      <Card>
        <div style={{ display: "grid", gap: 8, fontSize: 12 }}>
          {[
            ["R32 (Sechzehntelfinale)", "28. Juni – 02. Juli"],
            ["R16 (Achtelfinale)", "04. – 07. Juli"],
            ["Viertelfinale", "09. – 11. Juli"],
            ["Halbfinale", "14. – 15. Juli"],
            ["Spiel um Platz 3", "18. Juli"],
            ["🏆 Finale", "19. Juli, 21:00 MESZ · MetLife Stadium"],
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
          ← Zurück zur Übersicht
        </span>
      </div>
    </section>
  );
}
