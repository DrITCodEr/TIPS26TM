import { describe, expect, it } from "vitest";
import { poissonPMF, poissonRandom } from "@/lib/algorithms/poisson";
import { mulberry32 } from "@/lib/algorithms/random";

describe("poissonRandom", () => {
  it("returns 0 for non-positive lambda", () => {
    expect(poissonRandom(0)).toBe(0);
    expect(poissonRandom(-1)).toBe(0);
  });

  it("never returns more than 12 (safety cap)", () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 5000; i++) {
      expect(poissonRandom(8, rng)).toBeLessThanOrEqual(12);
    }
  });

  it("produces a mean close to lambda for lambda=2.5", () => {
    const rng = mulberry32(2);
    const N = 20_000;
    let sum = 0;
    for (let i = 0; i < N; i++) sum += poissonRandom(2.5, rng);
    expect(sum / N).toBeCloseTo(2.5, 0); // ±0.5 tolerance
  });

  it("produces a mean close to lambda for lambda=1.4", () => {
    const rng = mulberry32(3);
    const N = 20_000;
    let sum = 0;
    for (let i = 0; i < N; i++) sum += poissonRandom(1.4, rng);
    expect(sum / N).toBeCloseTo(1.4, 0);
  });

  it("is deterministic with a seeded RNG", () => {
    const a = Array.from({ length: 30 }, () => poissonRandom(1.4, mulberry32(11)));
    const b = Array.from({ length: 30 }, () => poissonRandom(1.4, mulberry32(11)));
    expect(a).toEqual(b);
  });
});

describe("poissonPMF", () => {
  it("returns 1 at k=0 when lambda=0", () => {
    expect(poissonPMF(0, 0)).toBe(1);
    expect(poissonPMF(0, 1)).toBe(0);
  });

  it("sums to ~1 over [0..12] for lambda=1.4", () => {
    let sum = 0;
    for (let k = 0; k <= 12; k++) sum += poissonPMF(1.4, k);
    expect(sum).toBeCloseTo(1.0, 4);
  });

  it("sums to ~1 over [0..15] for lambda=3.0", () => {
    let sum = 0;
    for (let k = 0; k <= 15; k++) sum += poissonPMF(3.0, k);
    expect(sum).toBeCloseTo(1.0, 4);
  });

  it("PMF(1.4, 1) matches analytic value", () => {
    // λ * e^-λ
    const expected = 1.4 * Math.exp(-1.4);
    expect(poissonPMF(1.4, 1)).toBeCloseTo(expected, 10);
  });
});
