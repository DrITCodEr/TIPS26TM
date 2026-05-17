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
