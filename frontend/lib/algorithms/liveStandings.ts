import type { GroupName, Team } from "@/lib/types/team";
import type { Match } from "@/lib/types/match";
import type { LiveMatchResult } from "@/lib/data/liveResults";

export interface GroupStanding {
  teamIdx: number;
  teamName: string;
  flag: string;
  spiele: number;
  gewonnen: number;
  unentschieden: number;
  verloren: number;
  tore: number;
  gegentore: number;
  td: number;
  pkt: number;
}

/**
 * Berechnet die aktuellen Gruppentabellen aus den eingetragenen
 * Live-Ergebnissen. Spiele ohne `isFinished` zählen nicht mit.
 *
 * Tiebreaker: Punkte → TD → Tore → alphabetisch (deterministisch).
 */
export function computeLiveStandings(
  liveResults: Record<number, LiveMatchResult>,
  schedule: Match[],
  teams: Team[],
): Record<GroupName, GroupStanding[]> {
  // Pro Team accumulator
  const stats = new Map<number, GroupStanding>();
  for (let i = 0; i < teams.length; i++) {
    stats.set(i, {
      teamIdx: i,
      teamName: teams[i].name,
      flag: teams[i].flag,
      spiele: 0,
      gewonnen: 0,
      unentschieden: 0,
      verloren: 0,
      tore: 0,
      gegentore: 0,
      td: 0,
      pkt: 0,
    });
  }

  // Nur Gruppenphasen-Spiele (Index < 72) und nur beendete
  for (let mi = 0; mi < schedule.length; mi++) {
    const r = liveResults[mi];
    if (!r || !r.isFinished) continue;
    const m = schedule[mi];
    const a = stats.get(m.idxA!)!;
    const b = stats.get(m.idxB!)!;
    a.spiele++;
    b.spiele++;
    a.tore += r.goalsA;
    a.gegentore += r.goalsB;
    b.tore += r.goalsB;
    b.gegentore += r.goalsA;
    a.td = a.tore - a.gegentore;
    b.td = b.tore - b.gegentore;
    if (r.goalsA > r.goalsB) {
      a.gewonnen++;
      a.pkt += 3;
      b.verloren++;
    } else if (r.goalsA < r.goalsB) {
      b.gewonnen++;
      b.pkt += 3;
      a.verloren++;
    } else {
      a.unentschieden++;
      a.pkt++;
      b.unentschieden++;
      b.pkt++;
    }
  }

  // Gruppieren + sortieren
  const groups: Record<GroupName, GroupStanding[]> = {} as Record<
    GroupName,
    GroupStanding[]
  >;
  for (let i = 0; i < teams.length; i++) {
    const g = teams[i].group;
    if (!groups[g]) groups[g] = [];
    groups[g].push(stats.get(i)!);
  }
  for (const g of Object.keys(groups) as GroupName[]) {
    groups[g].sort(
      (a, b) =>
        b.pkt - a.pkt ||
        b.td - a.td ||
        b.tore - a.tore ||
        a.teamName.localeCompare(b.teamName),
    );
  }
  return groups;
}

export type MatchPhase = "scheduled" | "finished";

/**
 * Status eines Matches in der echten Welt — abhängig nur von der
 * Live-Result-Tabelle, nicht von Datum/Uhrzeit (vermeidet
 * Zeitzonen-Gefummel).
 */
export function matchPhase(
  matchIdx: number,
  liveResults: Record<number, LiveMatchResult>,
): MatchPhase {
  const r = liveResults[matchIdx];
  if (r?.isFinished) return "finished";
  return "scheduled";
}
