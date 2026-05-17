import type { Team, GroupName } from "@/lib/types/team";
import type { Match } from "@/lib/types/match";
import type { FactorWeights } from "@/lib/types/factors";
import type { MarktQuoten } from "@/lib/types/odds";
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

function shuffleInPlace<T>(arr: T[], rng: Rng): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
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
    const result = simulateMatch(algorithm, staerken[a], staerken[b], rng);

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

  const qualifiziert: number[] = [];
  const dritte: GroupRecord[] = [];

  for (const g of Object.keys(groups) as GroupName[]) {
    const sorted = groups[g].sort(
      (a, b) =>
        b.pkt - a.pkt || b.td - a.td || b.tore - a.tore || rng() - 0.5,
    );
    for (let pos = 0; pos < sorted.length; pos++) {
      groupRankStats[sorted[pos].idx][pos]++;
    }
    qualifiziert.push(sorted[0].idx, sorted[1].idx);
    dritte.push(sorted[2]);
  }

  dritte.sort(
    (a, b) =>
      b.pkt - a.pkt || b.td - a.td || b.tore - a.tore || rng() - 0.5,
  );
  for (let i = 0; i < 8; i++) qualifiziert.push(dritte[i].idx);

  // === K.o.-Phase ===
  // Vorläufiges Bracket: zufällige Permutation der 32 Qualifizierten.
  // Echtes FIFA-Bracket-Mapping → Roadmap (Spec §12.3).
  shuffleInPlace(qualifiziert, rng);

  const reachedRound: Record<number, number> = {};
  for (const idx of qualifiziert) reachedRound[idx] = 1;

  let runde = qualifiziert;
  let stufe = 1;
  while (runde.length > 1) {
    stufe++;
    const naechste: number[] = new Array(runde.length / 2);
    for (let i = 0; i < runde.length; i += 2) {
      const sieger = simulateKnockout(
        algorithm,
        runde[i],
        runde[i + 1],
        staerken,
        rng,
      );
      naechste[i / 2] = sieger;
      reachedRound[sieger] = stufe;
    }
    runde = naechste;
  }
  const champion = runde[0];

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
    rng = defaultRng,
    onProgress,
  } = config;

  const staerken = calculateStrengths(algorithm, teams, weights, marktQuoten);

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
