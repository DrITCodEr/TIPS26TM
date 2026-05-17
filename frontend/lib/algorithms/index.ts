import type { Team } from "@/lib/types/team";
import type { FactorWeights } from "@/lib/types/factors";
import type { MarktQuoten } from "@/lib/types/odds";
import type { AlgorithmVersion } from "@/lib/types/simulation";
import { defaultRng, type Rng } from "./random";
import {
  calculateStrengths_v1,
  simulateMatch_v1,
  type MatchResult,
} from "./tips26v1";
import { calculateStrengths_v2, simulateMatch_v2 } from "./tips26v2";

export function calculateStrengths(
  algorithm: AlgorithmVersion,
  teams: Team[],
  weights: FactorWeights,
  marktQuoten?: MarktQuoten,
): number[] {
  if (algorithm === "v2") {
    if (!marktQuoten) {
      throw new Error("TIPS-26.2 (v2) requires marktQuoten.");
    }
    return calculateStrengths_v2(teams, weights, marktQuoten);
  }
  return calculateStrengths_v1(teams, weights);
}

export function simulateMatch(
  algorithm: AlgorithmVersion,
  sA: number,
  sB: number,
  rng: Rng = defaultRng,
): MatchResult {
  return algorithm === "v2"
    ? simulateMatch_v2(sA, sB, rng)
    : simulateMatch_v1(sA, sB, rng);
}

export type { MatchResult };
export { calculateStrengths_v1, calculateStrengths_v2, simulateMatch_v1, simulateMatch_v2 };
