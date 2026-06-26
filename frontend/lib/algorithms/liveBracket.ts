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
  /**
   * Finale Auflösung — für Gruppensieger/Zweiter wenn die jeweilige Gruppe
   * komplett durch ist; für bestThird-Slots erst wenn ALLE 12 Gruppen durch
   * sind (das Matching erfordert die globale Drittplatzierten-Liste).
   */
  resolvedTeamIdx: number | null;
  /**
   * Vorläufige Vorschau aus der aktuellen Tabelle — auch wenn die Gruppe
   * noch nicht beendet ist. Nur sinnvoll für groupWinner/groupRunnerUp.
   */
  provisionalTeamIdx: number | null;
}

export interface BracketMatchState {
  matchNo: number; // 1..16 (R32)
  a: BracketSlotState;
  b: BracketSlotState;
}

function isGroupFinished(
  standings: Record<GroupName, GroupStanding[]>,
  g: GroupName,
): boolean {
  const rows = standings[g];
  if (!rows || rows.length < 4) return false;
  return rows.every((s) => s.spiele === 3);
}

function provisional(
  slot: Slot,
  standings: Record<GroupName, GroupStanding[]>,
): number | null {
  if (slot.type === "groupWinner") {
    const rows = standings[slot.group];
    if (rows && rows[0] && rows.some((r) => r.spiele > 0)) return rows[0].teamIdx;
    return null;
  }
  if (slot.type === "groupRunnerUp") {
    const rows = standings[slot.group];
    if (rows && rows[1] && rows.some((r) => r.spiele > 0)) return rows[1].teamIdx;
    return null;
  }
  // bestThird kann nicht vorab aufgelöst werden — braucht globalen Vergleich
  return null;
}

/**
 * Leitet die 16 R32-Paarungen aus den aktuellen Live-Gruppentabellen ab.
 *
 * Anders als die ursprüngliche All-or-Nothing-Variante füllt sich der
 * Bracket fortlaufend:
 *
 * - Sobald eine Gruppe ihre 3 Spielrunden beendet hat, sind ihr Sieger
 *   (1A, 1B, …) und Zweiter (2A, 2B, …) als `resolvedTeamIdx` gesetzt.
 * - Solange die Gruppe noch läuft, steht die aktuelle Tabellenführung
 *   in `provisionalTeamIdx` zur Verfügung (für die UI als „vorläufig").
 * - bestThird-Slots (3ABCDF, 3CDFGH, …) lassen sich erst auflösen, wenn
 *   ALLE 12 Gruppen durch sind — sie bleiben bis dahin `null`.
 */
export function deriveLiveBracket(
  standings: Record<GroupName, GroupStanding[]>,
): BracketMatchState[] {
  const allGroupsDone = (Object.keys(standings) as GroupName[]).every((g) =>
    isGroupFinished(standings, g),
  );

  let thirdsResolved: ResolvedR32 | null = null;
  if (allGroupsDone) {
    const groupSorted: Record<GroupName, number[]> = {} as Record<GroupName, number[]>;
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
    try {
      thirdsResolved = resolveR32(groupSorted, bestThirds);
    } catch {
      thirdsResolved = null;
    }
  }

  return R32_MATCHES.map((pair, mi) => {
    const resolveOne = (
      slot: Slot,
      side: 0 | 1,
    ): { resolved: number | null; prov: number | null } => {
      if (slot.type === "bestThird") {
        return {
          resolved: thirdsResolved ? thirdsResolved.matches[mi][side] : null,
          prov: null,
        };
      }
      if (isGroupFinished(standings, slot.group)) {
        const idx = slot.type === "groupWinner" ? 0 : 1;
        return { resolved: standings[slot.group][idx].teamIdx, prov: null };
      }
      return { resolved: null, prov: provisional(slot, standings) };
    };
    const a = resolveOne(pair[0], 0);
    const b = resolveOne(pair[1], 1);
    return {
      matchNo: mi + 1,
      a: { slot: pair[0], resolvedTeamIdx: a.resolved, provisionalTeamIdx: a.prov },
      b: { slot: pair[1], resolvedTeamIdx: b.resolved, provisionalTeamIdx: b.prov },
    };
  });
}

/** Anzahl bereits komplett abgeschlossener Gruppen (0..12). */
export function countFinishedGroups(
  standings: Record<GroupName, GroupStanding[]>,
): number {
  return (Object.keys(standings) as GroupName[]).filter((g) =>
    isGroupFinished(standings, g),
  ).length;
}
