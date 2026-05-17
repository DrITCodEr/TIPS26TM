import { defaultRng, type Rng } from "./random";

/**
 * Knuth-Algorithmus für Poisson-Sampling.
 * Funktioniert gut für λ < ~10. Cap auf k=12 als Safety-Net (Prototyp-Parität).
 */
export function poissonRandom(lambda: number, rng: Rng = defaultRng): number {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L && k < 12);
  return k - 1;
}

/**
 * Probability Mass Function für analytische Berechnungen
 * (z.B. synthetische Match-Quoten in Edge-Analyse).
 */
export function poissonPMF(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let factorial = 1;
  for (let i = 1; i <= k; i++) factorial *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
}
