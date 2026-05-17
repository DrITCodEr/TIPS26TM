import type { FactorWeights } from "./factors";

export type AlgorithmVersion = "v1" | "v2" | "v3" | "v4";

export interface TeamStats {
  /** Anzahl Sim mit diesem Team als Weltmeister */
  titel: number;
  finale: number;
  hf: number;
  vf: number;
  achtel: number;
}

export interface MatchStats {
  winA: number;
  draw: number;
  winB: number;
  goalsA: number;
  goalsB: number;
  scores: Record<string, number>; // "1-0" → Anzahl
}

/** Position-Counts pro Team (Index = Platz 1..4) */
export type GroupRankStats = [number, number, number, number];

export interface SimulationResult {
  algorithm: AlgorithmVersion;
  numSimulations: number;
  weights: FactorWeights;
  staerken: number[];
  stats: TeamStats[];
  matchStats: MatchStats[];
  groupRankStats: GroupRankStats[];
}
