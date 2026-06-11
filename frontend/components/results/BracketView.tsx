"use client";

import { LIVE_RESULTS, LIVE_RESULTS_UPDATED_AT } from "@/lib/data/liveResults";
import { SCHEDULE } from "@/lib/data/schedule";
import { TEAMS } from "@/lib/data/teams";
import { computeLiveStandings } from "@/lib/algorithms/liveStandings";
import { deriveLiveBracket } from "@/lib/algorithms/liveBracket";
import { slotLabel } from "@/lib/algorithms/fifaBracket";
import { Card, SectionTitle } from "@/components/ui/Card";
import { InfoBanner } from "@/components/ui/InfoBanner";

export function BracketView() {
  const standings = computeLiveStandings(LIVE_RESULTS, SCHEDULE, TEAMS);
  const bracket = deriveLiveBracket(standings);

  const allFinished = bracket.every((m) => m.a.resolvedTeamIdx !== null);
  const totalFinishedGroupGames = Object.values(LIVE_RESULTS).filter(
    (r) => r.isFinished,
  ).length;

  return (
    <section>
      <InfoBanner icon="🏆">
        <strong>K.o.-Bracket nach FIFA-Schema.</strong>{" "}
        {allFinished
          ? "Alle Gruppenspiele abgeschlossen — die R32-Paarungen sind final."
          : `Slot-Labels gemäß offizieller FIFA-Tabelle. ${totalFinishedGroupGames} / 72 Gruppenspielen aktualisiert. Sobald die Gruppenphase fertig ist, fülle ich die Slots automatisch.`}
      </InfoBanner>

      {LIVE_RESULTS_UPDATED_AT && (
        <div
          className="text-[10px] mb-3 px-1"
          style={{ color: "var(--text-tertiary)" }}
        >
          Live-Daten zuletzt aktualisiert: {LIVE_RESULTS_UPDATED_AT}
        </div>
      )}

      <SectionTitle>🎯 Sechzehntelfinale (R32)</SectionTitle>
      <div className="space-y-2">
        {bracket.map((m) => (
          <Card key={m.matchNo}>
            <div
              className="text-[10px] mb-1.5 font-bold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              R32 · Match {m.matchNo}
            </div>
            <div className="flex items-center justify-between">
              <SlotChip slot={m.a} />
              <span
                className="text-[11px] font-bold mx-2"
                style={{ color: "var(--text-tertiary)" }}
              >
                vs
              </span>
              <SlotChip slot={m.b} alignRight />
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle>📅 Bracket-Termine</SectionTitle>
      <Card>
        <div className="text-[12px] grid gap-2" style={{ color: "var(--text-secondary)" }}>
          <RowDate label="R32 (Sechzehntelfinale)" value="28. Juni – 02. Juli" />
          <RowDate label="R16 (Achtelfinale)" value="04. – 07. Juli" />
          <RowDate label="Viertelfinale" value="09. – 11. Juli" />
          <RowDate label="Halbfinale" value="14. – 15. Juli" />
          <RowDate label="Spiel um Platz 3" value="18. Juli" />
          <RowDate label="🏆 Finale" value="19. Juli, 21:00 MESZ · MetLife Stadium" />
        </div>
      </Card>
    </section>
  );
}

function SlotChip({
  slot,
  alignRight,
}: {
  slot: ReturnType<typeof deriveLiveBracket>[number]["a"];
  alignRight?: boolean;
}) {
  const label = slotLabel(slot.slot);
  const team =
    slot.resolvedTeamIdx !== null ? TEAMS[slot.resolvedTeamIdx] : null;

  return (
    <div
      className={`flex items-center gap-2 flex-1 min-w-0 ${alignRight ? "justify-end" : ""}`}
    >
      {!alignRight && team && <span className="text-[18px]">{team.flag}</span>}
      <div className={`min-w-0 ${alignRight ? "text-right" : ""}`}>
        {team ? (
          <div className="text-[13px] font-bold truncate">{team.name}</div>
        ) : (
          <div
            className="text-[12px] font-semibold truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {label}
          </div>
        )}
        {team && (
          <div
            className="text-[9px]"
            style={{ color: "var(--text-tertiary)" }}
          >
            {label}
          </div>
        )}
      </div>
      {alignRight && team && <span className="text-[18px]">{team.flag}</span>}
    </div>
  );
}

function RowDate({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
