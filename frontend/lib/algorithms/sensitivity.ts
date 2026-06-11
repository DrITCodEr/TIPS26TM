import type { Team } from "@/lib/types/team";
import type { Match } from "@/lib/types/match";
import type { FactorWeights } from "@/lib/types/factors";
import type { MarktQuoten } from "@/lib/types/odds";
import type { PlayerAggregates } from "@/lib/types/player";
import type { AlgorithmVersion } from "@/lib/types/simulation";
import { FAKTOREN } from "@/lib/data/factors";
import { calculateStrengths } from "./index";
import { simulateOneTournament } from "./monteCarlo";
import { defaultRng, type Rng } from "./random";

export interface SensitivityTeamStats {
  idx: number;
  name: string;
  flag: string;
  median: number;
  p25: number;
  p75: number;
  min: number;
  max: number;
  mean: number;
}

export interface SensitivityResult {
  rangePercent: number;
  numPerturbations: number;
  numSubSimulations: number;
  stats: SensitivityTeamStats[];
}

export interface SensitivityConfig {
  algorithm: AlgorithmVersion;
  baseWeights: FactorWeights;
  /** ±X % Perturbation pro Faktor */
  rangePercent: 15 | 30 | 50;
  numPerturbations: number;
  numSubSimulations: number;
  teams: Team[];
  schedule: Match[];
  marktQuoten?: MarktQuoten;
  playerAggregates?: Record<string, PlayerAggregates>;
  surpriseSigma?: number;
  dispersion?: number;
  dfbAlwaysWins?: boolean;
  rng?: Rng;
  onProgress?: (progress: number) => void;
}

function perturbWeights(
  weights: FactorWeights,
  rangePercent: number,
  rng: Rng,
): FactorWeights {
  const factor = rangePercent / 100;
  const out = { ...weights };
  for (const f of FAKTOREN) {
    const v = weights[f.key];
    const perturbed = v * (1 + (rng() * 2 - 1) * factor);
    out[f.key] = Math.max(0.1, perturbed);
  }
  return out;
}

export function quantile(sortedAsc: number[], q: number): number {
  if (sortedAsc.length === 0) return 0;
  const pos = (sortedAsc.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sortedAsc[base + 1];
  if (next !== undefined) {
    return sortedAsc[base] + rest * (next - sortedAsc[base]);
  }
  return sortedAsc[base];
}

/**
 * Sensitivitätsanalyse: variiert alle 9 Faktor-Gewichte zufällig um
 * ±rangePercent und prüft, wie stark sich die Titel-Wahrscheinlichkeit
 * pro Team verschiebt.
 *
 * Default: 20 Perturbationen × 500 Sub-Sims = 10 000 Turniere insgesamt.
 */
export async function runSensitivity(
  config: SensitivityConfig,
): Promise<SensitivityResult> {
  const {
    algorithm,
    baseWeights,
    rangePercent,
    numPerturbations,
    numSubSimulations,
    teams,
    schedule,
    marktQuoten,
    playerAggregates,
    surpriseSigma = 0,
    dispersion = 0,
    dfbAlwaysWins = false,
    rng = defaultRng,
    onProgress,
  } = config;

  // Pro Team: Liste der Titel-% über alle Perturbationen
  const titelMatrix: number[][] = teams.map(() => []);

  for (let p = 0; p < numPerturbations; p++) {
    const weights = perturbWeights(baseWeights, rangePercent, rng);
    const staerken = calculateStrengths(
      algorithm,
      teams,
      weights,
      marktQuoten,
      playerAggregates,
    );

    // Schlanke Sub-Sim: reuse Buffers
    const teamStats = teams.map(() => ({
      titel: 0,
      finale: 0,
      hf: 0,
      vf: 0,
      achtel: 0,
    }));
    const matchStats = schedule.map(() => ({
      winA: 0,
      draw: 0,
      winB: 0,
      goalsA: 0,
      goalsB: 0,
      scores: {} as Record<string, number>,
    }));
    const groupRankStats = teams.map(
      () => [0, 0, 0, 0] as [number, number, number, number],
    );

    for (let s = 0; s < numSubSimulations; s++) {
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
        dispersion,
        dfbAlwaysWins,
      });
    }

    for (let i = 0; i < teams.length; i++) {
      titelMatrix[i].push((teamStats[i].titel / numSubSimulations) * 100);
    }

    if (onProgress) onProgress((p + 1) / numPerturbations);
    await Promise.resolve();
  }

  const stats: SensitivityTeamStats[] = teams.map((t, i) => {
    const arr = [...titelMatrix[i]].sort((a, b) => a - b);
    const sum = arr.reduce((acc, v) => acc + v, 0);
    return {
      idx: i,
      name: t.name,
      flag: t.flag,
      median: quantile(arr, 0.5),
      p25: quantile(arr, 0.25),
      p75: quantile(arr, 0.75),
      min: arr[0],
      max: arr[arr.length - 1],
      mean: sum / arr.length,
    };
  });

  return {
    rangePercent,
    numPerturbations,
    numSubSimulations,
    stats,
  };
}
