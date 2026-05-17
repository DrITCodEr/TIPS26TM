import { describe, expect, it } from "vitest";
import { mulberry32 } from "@/lib/algorithms/random";

describe("mulberry32", () => {
  it("is deterministic for the same seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 50 }, () => a());
    const seqB = Array.from({ length: 50 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("produces values in [0, 1)", () => {
    const rng = mulberry32(123);
    for (let i = 0; i < 2000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("has mean close to 0.5 over many samples", () => {
    const rng = mulberry32(7);
    let sum = 0;
    const N = 20_000;
    for (let i = 0; i < N; i++) sum += rng();
    expect(sum / N).toBeCloseTo(0.5, 1);
  });
});
