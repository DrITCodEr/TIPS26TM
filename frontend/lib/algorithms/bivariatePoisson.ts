import { defaultRng, type Rng } from "./random";
import { poissonRandom } from "./poisson";
import type { MatchResult } from "./tips26v1";

/**
 * Default für den gemeinsamen Tor-Anteil λ₃ in der Bivariate-Poisson.
 *
 * Empirische Schätzungen aus Karlis & Ntzoufras (2003) auf europäischen
 * Ligen liegen typischerweise zwischen 0.1 und 0.3, mit 0.2 als Median.
 * Höhere Werte → stärkere positive Korrelation zwischen den Toren beider
 * Teams (offene Spiele).
 */
export const DEFAULT_LAMBDA3 = 0.2;

/**
 * Bivariate Poisson nach Karlis & Ntzoufras (2003):
 *
 *   X_A = X_1 + X_3   X_B = X_2 + X_3
 *   X_1 ~ Pois(λ_total_A − λ_3)
 *   X_2 ~ Pois(λ_total_B − λ_3)
 *   X_3 ~ Pois(λ_3)        — gemeinsamer Anteil
 *
 * Marginal-Mittelwerte bleiben λ_total_A und λ_total_B (Faltung von zwei
 * unabhängigen Poissons ist wieder Poisson). Cov(X_A, X_B) = λ_3, also
 * positive Korrelation — modelliert „offen vs. verschlossen" Spiele.
 *
 * Konzeptionell schließt das die bekannte Schwäche unabhängiger Poissons
 * (Score-Verteilung zu eindimensional, Diagonal-Ergebnisse 2:2 / 3:3 zu
 * selten) und ersetzt die Dixon-Coles-τ-Approximation aus v2.
 */
export function sampleBivariatePoisson(
  lambdaA_total: number,
  lambdaB_total: number,
  lambda3: number = DEFAULT_LAMBDA3,
  rng: Rng = defaultRng,
): MatchResult {
  // λ_3 darf nicht größer als min(λ_A, λ_B) sein, sonst gehen die
  // unabhängigen Anteile ins Negative. Clip auf 95 % des Minimums.
  const lambda3Effective = Math.min(
    lambda3,
    0.95 * Math.min(lambdaA_total, lambdaB_total),
  );
  const lambda1 = Math.max(0.01, lambdaA_total - lambda3Effective);
  const lambda2 = Math.max(0.01, lambdaB_total - lambda3Effective);

  const x3 = poissonRandom(lambda3Effective, rng);
  return {
    toreA: poissonRandom(lambda1, rng) + x3,
    toreB: poissonRandom(lambda2, rng) + x3,
  };
}
