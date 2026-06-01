import { describe, expect, it } from "vitest";
import { negBinomialRandom, poissonRandom } from "@/lib/algorithms/poisson";
import { sampleGamma, mulberry32 } from "@/lib/algorithms/random";
import { runMonteCarlo } from "@/lib/algorithms/monteCarlo";
import { TEAMS } from "@/lib/data/teams";
import { SCHEDULE } from "@/lib/data/schedule";
import { MARKT_QUOTEN } from "@/lib/data/marktQuoten";
import { PLAYER_AGGREGATES } from "@/lib/data/playerAggregates";
import { PRESETS } from "@/lib/data/presets";

describe("sampleGamma", () => {
  it("has mean ≈ shape · scale", () => {
    const rng = mulberry32(1);
    const N = 20_000;
    let sum = 0;
    for (let i = 0; i < N; i++) sum += sampleGamma(2, 1.5, rng);
    expect(sum / N).toBeCloseTo(3, 0); // ±0.5
  });

  it("has variance ≈ shape · scale²", () => {
    const rng = mulberry32(2);
    const N = 30_000;
    const shape = 2;
    const scale = 1.5;
    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < N; i++) {
      const x = sampleGamma(shape, scale, rng);
      sum += x;
      sumSq += x * x;
    }
    const mean = sum / N;
    const variance = sumSq / N - mean * mean;
    const expectedVar = shape * scale * scale;
    expect(variance).toBeCloseTo(expectedVar, 0); // ±0.5
  });

  it("works for shape < 1 (boost trick)", () => {
    const rng = mulberry32(3);
    for (let i = 0; i < 100; i++) {
      const x = sampleGamma(0.5, 1, rng);
      expect(Number.isFinite(x)).toBe(true);
      expect(x).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("negBinomialRandom", () => {
  it("with dispersion=0 is identical to poissonRandom for same seed", () => {
    const a = Array.from({ length: 50 }, (_, i) =>
      negBinomialRandom(1.4, 0, mulberry32(i + 1)),
    );
    const b = Array.from({ length: 50 }, (_, i) =>
      poissonRandom(1.4, mulberry32(i + 1)),
    );
    expect(a).toEqual(b);
  });

  it("preserves marginal mean E[X] = λ for dispersion > 0", () => {
    const rng = mulberry32(7);
    const N = 30_000;
    let sum = 0;
    for (let i = 0; i < N; i++) sum += negBinomialRandom(1.4, 0.25, rng);
    expect(sum / N).toBeCloseTo(1.4, 0); // ±0.5
  });

  it("variance grows linearly with dispersion (Var = λ(1+φ))", () => {
    const lambda = 1.4;
    const N = 30_000;
    const variance = (phi: number, seed: number) => {
      const rng = mulberry32(seed);
      let s = 0;
      let s2 = 0;
      for (let i = 0; i < N; i++) {
        const x = negBinomialRandom(lambda, phi, rng);
        s += x;
        s2 += x * x;
      }
      const m = s / N;
      return s2 / N - m * m;
    };
    const v0 = variance(0, 100);
    const v_high = variance(0.3, 101);
    expect(v_high).toBeGreaterThan(v0 + 0.1);
  });

  it("produces noticeably more 4+ goal counts at φ=0.3 vs φ=0", () => {
    const lambda = 1.4;
    const N = 30_000;
    const countHigh = (phi: number, seed: number) => {
      const rng = mulberry32(seed);
      let n = 0;
      for (let i = 0; i < N; i++) {
        if (negBinomialRandom(lambda, phi, rng) >= 4) n++;
      }
      return n;
    };
    const poissonHigh = countHigh(0, 200);
    const dispersedHigh = countHigh(0.3, 201);
    expect(dispersedHigh).toBeGreaterThan(poissonHigh);
  });
});

describe("runMonteCarlo with dispersion", () => {
  it("dispersion=0 produces identical results to default", async () => {
    const cfg = {
      algorithm: "v2" as const,
      weights: PRESETS.default,
      numSimulations: 100,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      playerAggregates: PLAYER_AGGREGATES,
    };
    const a = await runMonteCarlo({ ...cfg, rng: mulberry32(11), dispersion: 0 });
    const b = await runMonteCarlo({ ...cfg, rng: mulberry32(11) });
    expect(a.stats.map((s) => s.titel)).toEqual(b.stats.map((s) => s.titel));
  });

  it("dispersion=0.3 produces meaningfully more 4+-Tor matches", async () => {
    const cfg = {
      algorithm: "v2" as const,
      weights: PRESETS.default,
      numSimulations: 300,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      playerAggregates: PLAYER_AGGREGATES,
    };
    const sharp = await runMonteCarlo({ ...cfg, rng: mulberry32(20), dispersion: 0 });
    const burst = await runMonteCarlo({ ...cfg, rng: mulberry32(21), dispersion: 0.3 });

    const countHighScore = (result: typeof sharp) =>
      result.matchStats.reduce((acc, ms) => {
        for (const k of Object.keys(ms.scores)) {
          const [a, b] = k.split("-").map(Number);
          if (a + b >= 5) acc += ms.scores[k];
        }
        return acc;
      }, 0);
    expect(countHighScore(burst)).toBeGreaterThan(countHighScore(sharp));
  });
});
