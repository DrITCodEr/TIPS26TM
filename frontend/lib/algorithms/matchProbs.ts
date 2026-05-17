import { poissonPMF } from "./poisson";
import type { ForecastTriple } from "./metrics";

/**
 * Analytische W/D/L-Wahrscheinlichkeiten via Poisson-PMF-Summation.
 *
 * Nutzt die additive Tor-Formel aus TIPS-26.1 Classic:
 *   λ_A = max(0.1, 1.4 + (S_A − S_B) · 3.5)
 *
 * Summiert P(toreA, toreB) über das Gitter [0..MAX] × [0..MAX].
 * MAX = 8 erfasst >99.9 % der Wahrscheinlichkeitsmasse für λ ≤ 3.
 */
export function analyticMatchProbs_v1(
  sA: number,
  sB: number,
  maxGoals = 8,
): ForecastTriple {
  const diff = sA - sB;
  const lambdaA = Math.max(0.1, 1.4 + diff * 3.5);
  const lambdaB = Math.max(0.1, 1.4 - diff * 3.5);

  let winA = 0;
  let draw = 0;
  let winB = 0;
  for (let i = 0; i <= maxGoals; i++) {
    const pA = poissonPMF(lambdaA, i);
    for (let j = 0; j <= maxGoals; j++) {
      const pB = poissonPMF(lambdaB, j);
      const p = pA * pB;
      if (i > j) winA += p;
      else if (i < j) winB += p;
      else draw += p;
    }
  }
  const total = winA + draw + winB;
  return {
    winA: winA / total,
    draw: draw / total,
    winB: winB / total,
  };
}

/**
 * Log-lineare Variante (analog zu TIPS-26.2):
 *   log(λ) = c + (S_A − S_B) · scale   mit c = ln(1.4), scale = 0.9
 *
 * Optional ρ ∈ (-1, 1) für Dixon-Coles-τ-Korrektur an niedrigen Ergebnissen.
 */
export function analyticMatchProbs_v2(
  sA: number,
  sB: number,
  rho = -0.13,
  maxGoals = 8,
): ForecastTriple {
  const diff = sA - sB;
  const lambdaA = Math.exp(0.336 + diff * 0.9);
  const lambdaB = Math.exp(0.336 - diff * 0.9);

  let winA = 0;
  let draw = 0;
  let winB = 0;
  for (let i = 0; i <= maxGoals; i++) {
    const pA = poissonPMF(lambdaA, i);
    for (let j = 0; j <= maxGoals; j++) {
      const pB = poissonPMF(lambdaB, j);
      let tau = 1;
      // Exakte Dixon-Coles-τ-Korrektur an (0,0), (0,1), (1,0), (1,1)
      if (i === 0 && j === 0) tau = 1 - lambdaA * lambdaB * rho;
      else if (i === 0 && j === 1) tau = 1 + lambdaA * rho;
      else if (i === 1 && j === 0) tau = 1 + lambdaB * rho;
      else if (i === 1 && j === 1) tau = 1 - rho;
      const p = pA * pB * tau;
      if (i > j) winA += p;
      else if (i < j) winB += p;
      else draw += p;
    }
  }
  const total = winA + draw + winB;
  return {
    winA: winA / total,
    draw: draw / total,
    winB: winB / total,
  };
}
