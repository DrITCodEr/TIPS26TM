import { describe, expect, it } from "vitest";
import {
  DEFAULT_LAMBDA3,
  sampleBivariatePoisson,
} from "@/lib/algorithms/bivariatePoisson";
import { simulateMatch_v2 } from "@/lib/algorithms/tips26v2";
import { simulateMatch_v5 } from "@/lib/algorithms/tips26v5";
import { mulberry32 } from "@/lib/algorithms/random";

describe("sampleBivariatePoisson", () => {
  it("preserves marginal mean for team A: E[X_A] ≈ λ_A_total", () => {
    const rng = mulberry32(1);
    const N = 20_000;
    let sumA = 0;
    let sumB = 0;
    const lambdaA = 1.6;
    const lambdaB = 1.0;
    for (let i = 0; i < N; i++) {
      const { toreA, toreB } = sampleBivariatePoisson(
        lambdaA,
        lambdaB,
        DEFAULT_LAMBDA3,
        rng,
      );
      sumA += toreA;
      sumB += toreB;
    }
    expect(sumA / N).toBeCloseTo(lambdaA, 0); // ±0.5
    expect(sumB / N).toBeCloseTo(lambdaB, 0);
  });

  it("produces positive correlation between toreA and toreB", () => {
    const rng = mulberry32(2);
    const N = 20_000;
    const lambdaA = 1.4;
    const lambdaB = 1.4;
    let sumA = 0;
    let sumB = 0;
    let sumAB = 0;
    let sumA2 = 0;
    let sumB2 = 0;
    for (let i = 0; i < N; i++) {
      const { toreA, toreB } = sampleBivariatePoisson(
        lambdaA,
        lambdaB,
        0.3, // expliziter größerer λ_3 macht den Effekt stärker messbar
        rng,
      );
      sumA += toreA;
      sumB += toreB;
      sumAB += toreA * toreB;
      sumA2 += toreA * toreA;
      sumB2 += toreB * toreB;
    }
    const meanA = sumA / N;
    const meanB = sumB / N;
    const cov = sumAB / N - meanA * meanB;
    const varA = sumA2 / N - meanA * meanA;
    const varB = sumB2 / N - meanB * meanB;
    const corr = cov / Math.sqrt(varA * varB);
    expect(corr).toBeGreaterThan(0.05);
  });

  it("Cov(X_A, X_B) ≈ λ_3 (Karlis-Ntzoufras property)", () => {
    const rng = mulberry32(3);
    const N = 30_000;
    const lambda3 = 0.25;
    let sumA = 0;
    let sumB = 0;
    let sumAB = 0;
    for (let i = 0; i < N; i++) {
      const { toreA, toreB } = sampleBivariatePoisson(1.4, 1.4, lambda3, rng);
      sumA += toreA;
      sumB += toreB;
      sumAB += toreA * toreB;
    }
    const cov = sumAB / N - (sumA / N) * (sumB / N);
    expect(cov).toBeCloseTo(lambda3, 1); // ±0.05
  });

  it("clips λ_3 when it would exceed min(λ_A, λ_B)", () => {
    const rng = mulberry32(4);
    // λ_3 = 2 mit λ_A = 0.5 wäre kaputt → muss geclippt werden
    for (let i = 0; i < 100; i++) {
      const { toreA, toreB } = sampleBivariatePoisson(0.5, 0.5, 2.0, rng);
      expect(Number.isFinite(toreA)).toBe(true);
      expect(Number.isFinite(toreB)).toBe(true);
      expect(toreA).toBeGreaterThanOrEqual(0);
      expect(toreB).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("simulateMatch_v5 vs simulateMatch_v2", () => {
  it("v5 produces more diagonal draws (2:2, 3:3) than v2 for equal teams", () => {
    const N = 30_000;
    const rngV2 = mulberry32(100);
    const rngV5 = mulberry32(101);
    let diagonalsV2 = 0;
    let diagonalsV5 = 0;
    const isHighDiagonal = (a: number, b: number) =>
      a === b && a >= 2;
    for (let i = 0; i < N; i++) {
      const v2 = simulateMatch_v2(0.5, 0.5, rngV2);
      const v5 = simulateMatch_v5(0.5, 0.5, rngV5);
      if (isHighDiagonal(v2.toreA, v2.toreB)) diagonalsV2++;
      if (isHighDiagonal(v5.toreA, v5.toreB)) diagonalsV5++;
    }
    expect(diagonalsV5).toBeGreaterThan(diagonalsV2);
  });

  it("v5 marginal means stay close to v2", () => {
    const N = 20_000;
    const rngV2 = mulberry32(200);
    const rngV5 = mulberry32(201);
    let sumV2 = 0;
    let sumV5 = 0;
    for (let i = 0; i < N; i++) {
      const v2 = simulateMatch_v2(0.6, 0.4, rngV2);
      const v5 = simulateMatch_v5(0.6, 0.4, rngV5);
      sumV2 += v2.toreA + v2.toreB;
      sumV5 += v5.toreA + v5.toreB;
    }
    const meanV2 = sumV2 / N;
    const meanV5 = sumV5 / N;
    // Innerhalb ±10 % voneinander
    expect(Math.abs(meanV5 - meanV2) / meanV2).toBeLessThan(0.1);
  });

  it("v5 is deterministic with a seeded RNG", () => {
    const a = Array.from({ length: 30 }, (_, i) =>
      simulateMatch_v5(0.5, 0.5, mulberry32(i + 1)),
    );
    const b = Array.from({ length: 30 }, (_, i) =>
      simulateMatch_v5(0.5, 0.5, mulberry32(i + 1)),
    );
    expect(a).toEqual(b);
  });
});
