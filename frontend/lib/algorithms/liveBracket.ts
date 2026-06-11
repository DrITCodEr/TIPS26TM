import { R32_MATCHES, type Slot } from "@/lib/data/koBracket";
import {
  resolveR32,
  type QualifiedThird,
  type ResolvedR32,
} from "./fifaBracket";
import type { GroupStanding } from "./liveStandings";
import type { GroupName } from "@/lib/types/team";

export interface BracketSlotState {
  slot: Slot;
  /** Aufgelöstes Team (Index in TEAMS) — null wenn noch unklar */
  resolvedTeamIdx: number | null;
}

export interface BracketMatchState {
  matchNo: number; // 1..16 (R32)
  a: BracketSlotState;
  b: BracketSlotState;
}

/**
 * Versucht, das R32-Bracket aus den aktuellen Live-Gruppentabellen
 * abzuleiten. Wenn alle 12 Gruppen ihre Spiele beendet haben (jedes
 * Team 3 Spiele), wird das volle Bracket berechnet — sonst zeigen die
 * Slots ihre Labels.
 */
export function deriveLiveBracket(
  standings: Record<GroupName, GroupStanding[]>,
): BracketMatchState[] {
  const allGroupsDone = (Object.keys(standings) as GroupName[]).every((g) =>
    standings[g].every((s) => s.spiele === 3),
  );

  if (allGroupsDone) {
    // Sieger/Zweite/Dritte ermitteln, dann beste 8 Dritte
    const groupSorted: Record<GroupName, number[]> = {} as Record<
      GroupName,
      number[]
    >;
    const allThirds: {
      idx: number;
      group: GroupName;
      pkt: number;
      td: number;
      tore: number;
    }[] = [];
    for (const g of Object.keys(standings) as GroupName[]) {
      groupSorted[g] = standings[g].map((s) => s.teamIdx);
      const third = standings[g][2];
      if (third) {
        allThirds.push({
          idx: third.teamIdx,
          group: g,
          pkt: third.pkt,
          td: third.td,
          tore: third.tore,
        });
      }
    }
    allThirds.sort(
      (a, b) =>
        b.pkt - a.pkt ||
        b.td - a.td ||
        b.tore - a.tore ||
        a.group.localeCompare(b.group),
    );
    const bestThirds: QualifiedThird[] = allThirds.slice(0, 8).map((t) => ({
      idx: t.idx,
      group: t.group,
    }));

    let resolved: ResolvedR32 | null = null;
    try {
      resolved = resolveR32(groupSorted, bestThirds);
    } catch {
      // Edge case: keine gültige FIFA-Slot-Zuordnung möglich
      resolved = null;
    }
    return R32_MATCHES.map((pair, mi) => ({
      matchNo: mi + 1,
      a: {
        slot: pair[0],
        resolvedTeamIdx: resolved ? resolved.matches[mi][0] : null,
      },
      b: {
        slot: pair[1],
        resolvedTeamIdx: resolved ? resolved.matches[mi][1] : null,
      },
    }));
  }

  // Noch nicht alle Spiele fertig — zeige nur die Slot-Labels
  return R32_MATCHES.map((pair, mi) => ({
    matchNo: mi + 1,
    a: { slot: pair[0], resolvedTeamIdx: null },
    b: { slot: pair[1], resolvedTeamIdx: null },
  }));
}
