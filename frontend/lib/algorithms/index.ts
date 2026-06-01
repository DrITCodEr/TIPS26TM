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
import { simulateMatch_v5 } from "./tips26v5";

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
  if (algorithm === "v2" || algorithm === "v5") {
    // v5 nutzt dieselbe v2-Stärke-Berechnung (Markt-Blend), nur die
    // Tor-Sim unterscheidet sich.
    if (!marktQuoten) {
      throw new Error(
        `TIPS-26.${algorithm === "v5" ? "5" : "2"} requires marktQuoten.`,
      );
    }
    return calculateStrengths_v2(teams, weights, marktQuoten);
  }
  return calculateStrengths_v1(teams, weights);
}

/**
 * Match-Simulation Dispatcher.
 *
 *   v1   : additive Poisson, unabhängige Tore
 *   v2/3/4: log-linear + Dixon-Coles-Approximation
 *   v5   : log-linear + Bivariate Poisson (Karlis-Ntzoufras 2003)
 *
 * v3/v4 reuse das v2-Tor-Modell — das Player-/Ensemble-Signal wirkt
 * ausschließlich über die Pre-Tournament-Stärke.
 *
 * `surpriseSigma` ∈ [0, 0.30]: optionale Tagesform-Streuung. Wenn > 0,
 * werden beide Stärken pro Match mit einem unabhängigen Uniform-Noise
 * (1 ± sigma) multipliziert — orthogonal zur Algorithmus-Wahl. Default 0.
 */
export function simulateMatch(
  algorithm: AlgorithmVersion,
  sA: number,
  sB: number,
  rng: Rng = defaultRng,
  surpriseSigma = 0,
): MatchResult {
  let effA = sA;
  let effB = sB;
  if (surpriseSigma > 0) {
    effA = sA * (1 + (rng() * 2 - 1) * surpriseSigma);
    effB = sB * (1 + (rng() * 2 - 1) * surpriseSigma);
  }
  if (algorithm === "v5") return simulateMatch_v5(effA, effB, rng);
  if (algorithm === "v2" || algorithm === "v3" || algorithm === "v4") {
    return simulateMatch_v2(effA, effB, rng);
  }
  return simulateMatch_v1(effA, effB, rng);
}

export type { MatchResult };
export {
  calculateStrengths_v1,
  calculateStrengths_v2,
  calculateStrengths_v3,
  calculateStrengths_v4,
  simulateMatch_v1,
  simulateMatch_v2,
  simulateMatch_v5,
};
