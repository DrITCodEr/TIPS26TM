import type { Team, GroupName } from "@/lib/types/team";
import type { Match } from "@/lib/types/match";
import type { FactorWeights } from "@/lib/types/factors";
import type { MarktQuoten } from "@/lib/types/odds";
import type { PlayerAggregates } from "@/lib/types/player";
import type {
  AlgorithmVersion,
  GroupRankStats,
  MatchStats,
  SimulationResult,
  TeamStats,
} from "@/lib/types/simulation";
import { calculateStrengths, simulateMatch } from "./index";
import { simulateKnockout } from "./knockout";
import { defaultRng, type Rng } from "./random";
import { resolveR32, type QualifiedThird } from "./fifaBracket";
import { R16_ROUND, QF_ROUND, SF_ROUND } from "@/lib/data/koBracket";

interface GroupRecord {
  idx: number;
  pkt: number;
  td: number;
  tore: number;
}

interface TournamentOutcome {
  champion: number;
  /** Index → höchste erreichte Runde (1 = Gruppensieger, 5 = Finalist, 6 = Champion) */
  reachedRound: Record<number, number>;
}

function createTeamStats(): TeamStats {
  return { titel: 0, finale: 0, hf: 0, vf: 0, achtel: 0 };
}

function createMatchStats(): MatchStats {
  return { winA: 0, draw: 0, winB: 0, goalsA: 0, goalsB: 0, scores: {} };
}

function createGroupRankStats(): GroupRankStats {
  return [0, 0, 0, 0];
}

/**
 * Spielt die K.o.-Runden nach der FIFA-2026-Bracket-Reihenfolge aus.
 *
 * Eingabe: 32 Team-Indizes in R32-Match-Reihenfolge (M1 = Slot 0/1,
 * M2 = Slot 2/3, …). Jede Runde nutzt die Feeder-Indizes der nächsten
 * Runde aus `koBracket.ts`.
 *
 * `reachedRound`-Konvention (kompatibel mit altem Code):
 *   1 = R32 erreicht  · 2 = R16 erreicht  · 3 = QF erreicht
 *   4 = SF erreicht   · 5 = Finale       · 6 = Weltmeister
 */
function playKnockoutBracket(
  algorithm: AlgorithmVersion,
  r32Slots: number[],
  staerken: number[],
  rng: Rng,
  surpriseSigma: number,
): { champion: number; reachedRound: Record<number, number> } {
  const reachedRound: Record<number, number> = {};
  for (const idx of r32Slots) reachedRound[idx] = 1;

  // R32 → 16 Sieger
  const r32Winners = new Array<number>(16);
  for (let m = 0; m < 16; m++) {
    const winner = simulateKnockout(
      algorithm,
      r32Slots[m * 2],
      r32Slots[m * 2 + 1],
      staerken,
      rng,
      surpriseSigma,
    );
    reachedRound[winner] = 2;
    r32Winners[m] = winner;
  }

  // R16 → 8 Sieger (Feeder aus R16_ROUND)
  const r16Winners = new Array<number>(8);
  for (let m = 0; m < R16_ROUND.feeders.length; m++) {
    const [a, b] = R16_ROUND.feeders[m];
    const winner = simulateKnockout(
      algorithm,
      r32Winners[a],
      r32Winners[b],
      staerken,
      rng,
      surpriseSigma,
    );
    reachedRound[winner] = 3;
    r16Winners[m] = winner;
  }

  // QF → 4 Sieger
  const qfWinners = new Array<number>(4);
  for (let m = 0; m < QF_ROUND.feeders.length; m++) {
    const [a, b] = QF_ROUND.feeders[m];
    const winner = simulateKnockout(
      algorithm,
      r16Winners[a],
      r16Winners[b],
      staerken,
      rng,
      surpriseSigma,
    );
    reachedRound[winner] = 4;
    qfWinners[m] = winner;
  }

  // SF → 2 Sieger
  const sfWinners = new Array<number>(2);
  for (let m = 0; m < SF_ROUND.feeders.length; m++) {
    const [a, b] = SF_ROUND.feeders[m];
    const winner = simulateKnockout(
      algorithm,
      qfWinners[a],
      qfWinners[b],
      staerken,
      rng,
      surpriseSigma,
    );
    reachedRound[winner] = 5;
    sfWinners[m] = winner;
  }

  // Finale
  const champion = simulateKnockout(
    algorithm,
    sfWinners[0],
    sfWinners[1],
    staerken,
    rng,
    surpriseSigma,
  );
  reachedRound[champion] = 6;
  return { champion, reachedRound };
}

/**
 * Simuliert ein einzelnes Turnier (Gruppen + K.o.) und akkumuliert
 * Statistiken in den übergebenen Buffern.
 *
 * Performance-kritisch: wird N-mal pro Run aufgerufen (N bis 1 Mio).
 * Daher: keine Allocations in inneren Schleifen, falls vermeidbar.
 */
export function simulateOneTournament(args: {
  algorithm: AlgorithmVersion;
  teams: Team[];
  schedule: Match[];
  staerken: number[];
  rng: Rng;
  teamStats: TeamStats[];
  matchStats: MatchStats[];
  groupRankStats: GroupRankStats[];
  surpriseSigma?: number;
}): TournamentOutcome {
  const {
    algorithm,
    teams,
    schedule,
    staerken,
    rng,
    teamStats,
    matchStats,
    groupRankStats,
    surpriseSigma = 0,
  } = args;

  // === Gruppenphase ===
  const groups: Record<GroupName, GroupRecord[]> = {} as Record<
    GroupName,
    GroupRecord[]
  >;
  for (let i = 0; i < teams.length; i++) {
    const g = teams[i].group;
    if (!groups[g]) groups[g] = [];
    groups[g].push({ idx: i, pkt: 0, td: 0, tore: 0 });
  }

  for (let mi = 0; mi < schedule.length; mi++) {
    const m = schedule[mi];
    const a = m.idxA!;
    const b = m.idxB!;
    const result = simulateMatch(
      algorithm,
      staerken[a],
      staerken[b],
      rng,
      surpriseSigma,
    );

    const ms = matchStats[mi];
    ms.goalsA += result.toreA;
    ms.goalsB += result.toreB;
    if (result.toreA > result.toreB) ms.winA++;
    else if (result.toreA < result.toreB) ms.winB++;
    else ms.draw++;
    const scoreKey = `${result.toreA}-${result.toreB}`;
    ms.scores[scoreKey] = (ms.scores[scoreKey] ?? 0) + 1;

    // 4 Teams pro Gruppe → linearer Scan ist ausreichend schnell
    const recA = groups[teams[a].group].find((r) => r.idx === a)!;
    const recB = groups[teams[b].group].find((r) => r.idx === b)!;

    recA.tore += result.toreA;
    recA.td += result.toreA - result.toreB;
    recB.tore += result.toreB;
    recB.td += result.toreB - result.toreA;
    if (result.toreA > result.toreB) recA.pkt += 3;
    else if (result.toreB > result.toreA) recB.pkt += 3;
    else {
      recA.pkt += 1;
      recB.pkt += 1;
    }
  }

  const groupSorted: Record<GroupName, number[]> = {} as Record<
    GroupName,
    number[]
  >;
  const dritte: GroupRecord[] = [];

  for (const g of Object.keys(groups) as GroupName[]) {
    const sorted = groups[g].sort(
      (a, b) =>
        b.pkt - a.pkt || b.td - a.td || b.tore - a.tore || rng() - 0.5,
    );
    for (let pos = 0; pos < sorted.length; pos++) {
      groupRankStats[sorted[pos].idx][pos]++;
    }
    groupSorted[g] = sorted.map((r) => r.idx);
    dritte.push(sorted[2]);
  }

  // 8 beste Dritte qualifizieren
  dritte.sort(
    (a, b) =>
      b.pkt - a.pkt || b.td - a.td || b.tore - a.tore || rng() - 0.5,
  );
  const bestThirds: QualifiedThird[] = dritte.slice(0, 8).map((r) => ({
    idx: r.idx,
    group: teams[r.idx].group,
  }));

  // === K.o.-Phase (FIFA-2026-Bracket) ===
  const { matches: r32Pairs } = resolveR32(groupSorted, bestThirds);
  // Flach in 32-Slot-Reihenfolge: M1 = Slot 0/1, M2 = Slot 2/3, …
  const r32Slots = new Array<number>(32);
  for (let m = 0; m < 16; m++) {
    r32Slots[m * 2] = r32Pairs[m][0];
    r32Slots[m * 2 + 1] = r32Pairs[m][1];
  }

  const { champion, reachedRound } = playKnockoutBracket(
    algorithm,
    r32Slots,
    staerken,
    rng,
    surpriseSigma,
  );

  // Akkumuliere Team-Stats auf Basis der erreichten Runde
  for (const k of Object.keys(reachedRound)) {
    const idx = Number(k);
    const r = reachedRound[idx];
    if (r >= 2) teamStats[idx].achtel++;
    if (r >= 3) teamStats[idx].vf++;
    if (r >= 4) teamStats[idx].hf++;
    if (r >= 5) teamStats[idx].finale++;
  }
  teamStats[champion].titel++;

  return { champion, reachedRound };
}

export interface MonteCarloConfig {
  algorithm: AlgorithmVersion;
  weights: FactorWeights;
  numSimulations: number;
  teams: Team[];
  schedule: Match[];
  marktQuoten?: MarktQuoten;
  playerAggregates?: Record<string, PlayerAggregates>;
  /**
   * Tagesform-Streuung pro Match, orthogonal zum Algorithmus.
   * 0 = deterministische Stärke. 0.30 = ±30 % pro Team pro Match (max).
   * UI nutzt 0..0.30 als Skala (entspricht 0..100 % „Surprise"-Slider).
   */
  surpriseSigma?: number;
  rng?: Rng;
  /** Wird ~100x pro Run aufgerufen mit progress ∈ [0, 1]. */
  onProgress?: (progress: number) => void;
}

/**
 * Vollständiger Monte-Carlo-Run. Async, damit `onProgress`-Callbacks
 * und ein optionaler `await yield`-Loop UI-freundlich integriert werden
 * können (Web Worker macht das später überflüssig).
 */
export async function runMonteCarlo(
  config: MonteCarloConfig,
): Promise<SimulationResult> {
  const {
    algorithm,
    weights,
    numSimulations,
    teams,
    schedule,
    marktQuoten,
    playerAggregates,
    surpriseSigma = 0,
    rng = defaultRng,
    onProgress,
  } = config;

  const staerken = calculateStrengths(
    algorithm,
    teams,
    weights,
    marktQuoten,
    playerAggregates,
  );

  const teamStats: TeamStats[] = teams.map(() => createTeamStats());
  const matchStats: MatchStats[] = schedule.map(() => createMatchStats());
  const groupRankStats: GroupRankStats[] = teams.map(() =>
    createGroupRankStats(),
  );

  // Batch-Size für UI-Updates: ca. 100 Schritte über den ganzen Run
  const BATCH = Math.max(50, Math.floor(numSimulations / 100));
  const numBatches = Math.ceil(numSimulations / BATCH);
  let done = 0;

  for (let b = 0; b < numBatches; b++) {
    const batchSize = Math.min(BATCH, numSimulations - done);
    for (let s = 0; s < batchSize; s++) {
      simulateOneTournament({
        algorithm,
        teams,
        schedule,
        staerken,
        rng,
        teamStats,
        matchStats,
        groupRankStats,
        surpriseSigma,
      });
    }
    done += batchSize;
    if (onProgress) onProgress(done / numSimulations);
    // Yield to UI / Worker-Message-Pump
    await Promise.resolve();
  }

  return {
    algorithm,
    numSimulations,
    weights,
    staerken,
    stats: teamStats,
    matchStats,
    groupRankStats,
  };
}
