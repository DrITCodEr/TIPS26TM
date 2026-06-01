import { defaultRng, type Rng } from "./random";
import { sampleBivariatePoisson, DEFAULT_LAMBDA3 } from "./bivariatePoisson";
import type { MatchResult } from "./tips26v1";

/**
 * TIPS-26.5 Bivariate
 *
 * Stärke-Berechnung identisch zu v2 (Composite + Markt-Konsens-Blend) — der
 * einzige Unterschied liegt in der Tor-Simulation:
 *
 *   v2:  λ_A, λ_B unabhängig + Dixon-Coles-τ-Resampling-Approximation
 *   v5:  Bivariate Poisson (Karlis-Ntzoufras 2003) mit gemeinsamem λ_3
 *
 * Der bivariate Anteil korreliert die Tore beider Teams (positive
 * Korrelation, modelliert „offene Spiele") und liefert eine realitätsnähere
 * Score-Verteilung mit weniger Konzentration auf 1:1 und mehr
 * Diagonal-Remis (2:2, 3:3).
 *
 * Marginal-Mittelwerte bleiben identisch zu v2:
 *   E[X_A] = exp(0.336 + diff · 0.9)
 *   E[X_B] = exp(0.336 − diff · 0.9)
 */
export function simulateMatch_v5(
  sA: number,
  sB: number,
  rng: Rng = defaultRng,
): MatchResult {
  const diff = sA - sB;
  const lambdaA = Math.exp(0.336 + diff * 0.9);
  const lambdaB = Math.exp(0.336 - diff * 0.9);
  return sampleBivariatePoisson(lambdaA, lambdaB, DEFAULT_LAMBDA3, rng);
}
