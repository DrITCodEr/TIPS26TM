import { defaultRng, sampleGamma, type Rng } from "./random";

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
 * Negativ-Binomial-Tor-Sampling als Gamma-Poisson-Mischung.
 *
 *   Λ ~ Gamma(shape = λ/φ, scale = φ)   →  E[Λ] = λ, Var[Λ] = λ·φ
 *   X ~ Poisson(Λ)                       →  E[X] = λ, Var[X] = λ(1 + φ)
 *
 * `dispersion` = φ ≥ 0. Bei φ = 0 → exakt poissonRandom (Var = λ).
 * Empirisch passt φ ≈ 0.10 – 0.25 für internationale Fußball-Matches und
 * gibt der Verteilung den realistischen „Burst"-Tail, der 4:1, 5:0, 7:1
 * gelegentlich vorkommen lässt.
 */
export function negBinomialRandom(
  lambda: number,
  dispersion: number,
  rng: Rng = defaultRng,
): number {
  if (dispersion <= 0 || lambda <= 0) return poissonRandom(lambda, rng);
  const lambdaStar = sampleGamma(lambda / dispersion, dispersion, rng);
  return poissonRandom(lambdaStar, rng);
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
