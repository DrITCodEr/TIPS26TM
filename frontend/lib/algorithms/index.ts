import type { Team } from "@/lib/types/team";
import type { FactorWeights } from "@/lib/types/factors";
import type { MarktQuoten } from "@/lib/types/odds";
import type { PlayerAggregates } from "@/lib/types/player";
import type { AlgorithmVersion } from "@/lib/types/simulation";
import { defaultRng, type Rng } from "./random";
import {
  calculateStrengths_v1,
  simulateMatch_v1,
  type MatchResult,
} from "./tips26v1";
import { calculateStrengths_v2, simulateMatch_v2 } from "./tips26v2";
import { calculateStrengths_v3 } from "./tips26v3";
import { calculateStrengths_v4 } from "./tips26v4";

export function calculateStrengths(
  algorithm: AlgorithmVersion,
  teams: Team[],
  weights: FactorWeights,
  marktQuoten?: MarktQuoten,
  playerAggregates?: Record<string, PlayerAggregates>,
): number[] {
  if (algorithm === "v4") {
    if (!marktQuoten || !playerAggregates) {
      throw new Error(
        "TIPS-26.4 (v4) requires marktQuoten + playerAggregates.",
      );
    }
    return calculateStrengths_v4(teams, weights, marktQuoten, playerAggregates);
  }
  if (algorithm === "v3") {
    if (!marktQuoten || !playerAggregates) {
      throw new Error(
        "TIPS-26.3 (v3) requires marktQuoten + playerAggregates.",
      );
    }
    return calculateStrengths_v3(teams, weights, marktQuoten, playerAggregates);
  }
  if (algorithm === "v2") {
    if (!marktQuoten) {
      throw new Error("TIPS-26.2 (v2) requires marktQuoten.");
    }
    return calculateStrengths_v2(teams, weights, marktQuoten);
  }
  return calculateStrengths_v1(teams, weights);
}

/**
 * Match-Simulation Dispatcher.
 *
 * v3 nutzt dasselbe Tor-Modell wie v2 (log-linear + Dixon-Coles). Das
 * Player-Signal wirkt ausschließlich über die Pre-Tournament-Stärke,
 * nicht über asymmetrische λ-Verschiebung.
 */
export function simulateMatch(
  algorithm: AlgorithmVersion,
  sA: number,
  sB: number,
  rng: Rng = defaultRng,
): MatchResult {
  if (algorithm === "v2" || algorithm === "v3" || algorithm === "v4") {
    return simulateMatch_v2(sA, sB, rng);
  }
  return simulateMatch_v1(sA, sB, rng);
}

export type { MatchResult };
export {
  calculateStrengths_v1,
  calculateStrengths_v2,
  calculateStrengths_v3,
  calculateStrengths_v4,
  simulateMatch_v1,
  simulateMatch_v2,
};
