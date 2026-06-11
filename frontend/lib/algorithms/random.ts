/**
 * Pluggable RNG für die Simulation.
 *
 * Production-Pfad nutzt `defaultRng` (== Math.random); Tests instanzieren
 * `mulberry32(seed)` für deterministische Ergebnisse.
 */
export type Rng = () => number;

export const defaultRng: Rng = Math.random;

/**
 * Mulberry32 — 32-Bit PRNG, sehr schnell, klein und ausreichend gleichverteilt
 * für Monte-Carlo-Smoke-Tests. Quelle: bryc / public-domain Snippets.
 */
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;
  return function rng() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard-Normal via Box-Muller (cosinus-arm). */
function standardNormal(rng: Rng): number {
  const u1 = Math.max(1e-12, rng());
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Gamma-Sampling nach Marsaglia & Tsang (2000). Schnell und numerisch stabil.
 * Für shape < 1 nutzen wir den Boost-Trick: G(α) = G(α+1) · U^(1/α).
 *
 * Parametrisierung: shape = α, scale = θ → E[X] = αθ, Var[X] = αθ².
 */
export function sampleGamma(shape: number, scale: number, rng: Rng = defaultRng): number {
  if (shape <= 0 || scale <= 0) return 0;
  if (shape < 1) {
    const g = sampleGamma(shape + 1, scale, rng);
    return g * Math.pow(Math.max(1e-12, rng()), 1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  // Acceptance-rejection mit (üblicherweise) <2 Iterationen
  for (let it = 0; it < 100; it++) {
    let x: number;
    let v: number;
    do {
      x = standardNormal(rng);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rng();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v * scale;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v * scale;
  }
  return d * scale; // Notfall-Fallback
}
