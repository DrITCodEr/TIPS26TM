import type { Team } from "@/lib/types/team";
import type { FactorWeights } from "@/lib/types/factors";
import { FAKTOREN } from "@/lib/data/factors";
import { normalizeFactor } from "./normalize";
import { poissonRandom } from "./poisson";
import { defaultRng, type Rng } from "./random";

export interface MatchResult {
  toreA: number;
  toreB: number;
}

/**
 * TIPS-26.1 Classic: Lineare gewichtete Aggregation
 *
 *   S_i = Σ_k (w_k * x_ik) / Σ_k w_k
 *
 * Alle 9 Faktoren werden auf [0, 1] normalisiert und dann gewichtet
 * summiert. Schwäche: Multikollinearität von ELO/FIFA/Markt wird ignoriert.
 */
export function calculateStrengths_v1(
  teams: Team[],
  weights: FactorWeights,
): number[] {
  const normalized = {} as Record<string, number[]>;
  for (const f of FAKTOREN) {
    normalized[f.key] = normalizeFactor(teams, f.key);
  }

  let totalWeight = 0;
  for (const f of FAKTOREN) totalWeight += weights[f.key];
  if (totalWeight === 0) totalWeight = 1;

  return teams.map((_, i) => {
    let score = 0;
    for (const f of FAKTOREN) {
      score += normalized[f.key][i] * weights[f.key];
    }
    return score / totalWeight;
  });
}

/**
 * Match-Simulation mit additivem Poisson.
 *
 *   λ_A = max(0.1, 1.4 + (S_A − S_B) * 3.5)
 *   λ_B = max(0.1, 1.4 − (S_A − S_B) * 3.5)
 *
 * 1.4 ist der typische durchschnittliche Tor-Erwartungswert pro Team pro Spiel
 * (empirisch bei internationalen Matches). 3.5 ist eine Skalierung.
 * `max(0.1, …)` verhindert unphysikalische negative λ — siehe v2 für die saubere
 * log-lineare Variante.
 */
export function simulateMatch_v1(
  sA: number,
  sB: number,
  rng: Rng = defaultRng,
): MatchResult {
  const diff = sA - sB;
  const lambdaA = Math.max(0.1, 1.4 + diff * 3.5);
  const lambdaB = Math.max(0.1, 1.4 - diff * 3.5);
  return {
    toreA: poissonRandom(lambdaA, rng),
    toreB: poissonRandom(lambdaB, rng),
  };
}
