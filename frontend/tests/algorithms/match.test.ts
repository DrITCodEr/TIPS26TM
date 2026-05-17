import { describe, expect, it } from "vitest";
import { simulateMatch_v1 } from "@/lib/algorithms/tips26v1";
import { simulateMatch_v2 } from "@/lib/algorithms/tips26v2";
import { mulberry32 } from "@/lib/algorithms/random";

describe("simulateMatch_v1 (additive Poisson)", () => {
  it("with equal strengths, A and B win at similar rates", () => {
    const rng = mulberry32(1);
    const N = 5000;
    let winA = 0;
    let winB = 0;
    let draw = 0;
    for (let i = 0; i < N; i++) {
      const r = simulateMatch_v1(0.5, 0.5, rng);
      if (r.toreA > r.toreB) winA++;
      else if (r.toreA < r.toreB) winB++;
      else draw++;
    }
    expect(Math.abs(winA - winB)).toBeLessThan(N * 0.05);
    expect(draw / N).toBeGreaterThan(0.15);
  });

  it("the stronger team wins more often", () => {
    const rng = mulberry32(2);
    const N = 5000;
    let winA = 0;
    let winB = 0;
    for (let i = 0; i < N; i++) {
      // Großer Stärken-Vorsprung für A
      const r = simulateMatch_v1(0.8, 0.2, rng);
      if (r.toreA > r.toreB) winA++;
      else if (r.toreA < r.toreB) winB++;
    }
    expect(winA).toBeGreaterThan(winB * 4);
  });
});

describe("simulateMatch_v2 (log-linear + Dixon-Coles)", () => {
  it("never produces NaN goals", () => {
    const rng = mulberry32(3);
    for (let i = 0; i < 2000; i++) {
      const r = simulateMatch_v2(Math.random(), Math.random(), rng);
      expect(Number.isFinite(r.toreA)).toBe(true);
      expect(Number.isFinite(r.toreB)).toBe(true);
    }
  });

  it("Dixon-Coles approximation produces more 1:1 draws than v1", () => {
    const N = 20_000;
    let count11_v1 = 0;
    let count11_v2 = 0;
    const rng1 = mulberry32(100);
    const rng2 = mulberry32(101);
    for (let i = 0; i < N; i++) {
      const v1 = simulateMatch_v1(0.5, 0.5, rng1);
      const v2 = simulateMatch_v2(0.5, 0.5, rng2);
      if (v1.toreA === 1 && v1.toreB === 1) count11_v1++;
      if (v2.toreA === 1 && v2.toreB === 1) count11_v2++;
    }
    expect(count11_v2).toBeGreaterThan(count11_v1);
  });
});
