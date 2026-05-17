import type { Team } from "@/lib/types/team";
import type { Match } from "@/lib/types/match";
import type { MarktQuoten } from "@/lib/types/odds";
import type { SimulationResult } from "@/lib/types/simulation";
import type { MatchEdge, TitelEdge } from "@/lib/types/edge";
import { MARKT_MARGIN } from "@/lib/data/marktQuoten";
import { poissonPMF } from "./poisson";
import { marktProbTitel } from "./tips26v2";

/**
 * Vergleicht Sim-Titel-% mit vig-bereinigter Markt-implizierter %.
 * Filter: nur Teams, bei denen mindestens eine Seite messbar > 0 ist.
 */
export function calculateTitelEdge(
  simulation: SimulationResult,
  teams: Team[],
  marktQuoten: MarktQuoten,
  margin: number = MARKT_MARGIN,
): TitelEdge[] {
  return teams
    .map((t, i) => {
      const simP = (simulation.stats[i].titel / simulation.numSimulations) * 100;
      const marktP = marktProbTitel(t.name, marktQuoten, margin) * 100;
      const edge = simP - marktP;
      return {
        teamIdx: i,
        name: t.name,
        flag: t.flag,
        simP,
        marktP,
        edge,
        absEdge: Math.abs(edge),
      };
    })
    .filter((t) => t.simP > 0.05 || t.marktP > 0.5)
    .sort((a, b) => b.absEdge - a.absEdge);
}

/**
 * Synthetische 1X2-Quoten aus Outright-Quoten + Poisson-Modell.
 *
 * Die meisten Buchmacher öffnen Match-Märkte erst kurz vor Anpfiff;
 * bis dahin leiten wir markt-konsistente Quoten ab:
 *   1. Outright → markt-implizite Titel-% pro Team (vig-bereinigt)
 *   2. → Markt-Stärke via Sqrt-Mapping
 *   3. → λ_A, λ_B mit derselben additiven Formel wie v1
 *   4. Analytische Summation über [0..8] × [0..8] für Win/Draw/Loss
 */
export function syntheticMatchProbs(
  teamNameA: string,
  teamNameB: string,
  teams: Team[],
  marktQuoten: MarktQuoten,
  margin: number = MARKT_MARGIN,
): { winA: number; draw: number; winB: number } {
  const marktProbs = teams.map((t) => marktProbTitel(t.name, marktQuoten, margin));
  const maxP = Math.max(...marktProbs);

  const idxA = teams.findIndex((t) => t.name === teamNameA);
  const idxB = teams.findIndex((t) => t.name === teamNameB);
  const sA = Math.sqrt(marktProbs[idxA] / maxP);
  const sB = Math.sqrt(marktProbs[idxB] / maxP);

  const lambdaA = Math.max(0.1, 1.4 + (sA - sB) * 3.5);
  const lambdaB = Math.max(0.1, 1.4 + (sB - sA) * 3.5);

  let winA = 0;
  let draw = 0;
  let winB = 0;
  for (let i = 0; i <= 8; i++) {
    const pA = poissonPMF(lambdaA, i);
    for (let j = 0; j <= 8; j++) {
      const pB = poissonPMF(lambdaB, j);
      const p = pA * pB;
      if (i > j) winA += p;
      else if (i < j) winB += p;
      else draw += p;
    }
  }
  const total = winA + draw + winB;
  return {
    winA: (winA / total) * 100,
    draw: (draw / total) * 100,
    winB: (winB / total) * 100,
  };
}

/**
 * Match-Edge: Sim-Wahrscheinlichkeit vs. synthetische Markt-Quote pro Match.
 * Default sortiert nach max(|edge|) absteigend.
 */
export function calculateMatchEdges(
  simulation: SimulationResult,
  teams: Team[],
  schedule: Match[],
  marktQuoten: MarktQuoten,
  margin: number = MARKT_MARGIN,
): MatchEdge[] {
  return schedule.map((m, i) => {
    const ms = simulation.matchStats[i];
    const N = simulation.numSimulations;
    const simWinA = (ms.winA / N) * 100;
    const simDraw = (ms.draw / N) * 100;
    const simWinB = (ms.winB / N) * 100;
    const market = syntheticMatchProbs(
      m.teamA,
      m.teamB,
      teams,
      marktQuoten,
      margin,
    );
    const edgeWinA = simWinA - market.winA;
    const edgeDraw = simDraw - market.draw;
    const edgeWinB = simWinB - market.winB;
    return {
      matchIdx: i,
      teamA: m.teamA,
      teamB: m.teamB,
      date: m.date,
      time: m.time,
      simWinA,
      simDraw,
      simWinB,
      marketWinA: market.winA,
      marketDraw: market.draw,
      marketWinB: market.winB,
      edgeWinA,
      edgeDraw,
      edgeWinB,
      maxAbsEdge: Math.max(
        Math.abs(edgeWinA),
        Math.abs(edgeDraw),
        Math.abs(edgeWinB),
      ),
    };
  });
}
