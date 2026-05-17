import { describe, expect, it } from "vitest";
import { quantile, runSensitivity } from "@/lib/algorithms/sensitivity";
import { TEAMS } from "@/lib/data/teams";
import { SCHEDULE } from "@/lib/data/schedule";
import { PRESETS } from "@/lib/data/presets";
import { mulberry32 } from "@/lib/algorithms/random";

describe("quantile", () => {
  it("returns the median for q=0.5 on a sorted array", () => {
    expect(quantile([1, 2, 3, 4, 5], 0.5)).toBe(3);
  });

  it("interpolates between values when needed", () => {
    expect(quantile([0, 10], 0.25)).toBeCloseTo(2.5, 6);
  });

  it("handles q=0 and q=1", () => {
    expect(quantile([2, 4, 6, 8], 0)).toBe(2);
    expect(quantile([2, 4, 6, 8], 1)).toBe(8);
  });
});

describe("runSensitivity (smoke)", () => {
  it("returns p25 <= median <= p75 and min <= max per team", async () => {
    const result = await runSensitivity({
      algorithm: "v1",
      baseWeights: PRESETS.default,
      rangePercent: 30,
      numPerturbations: 4,
      numSubSimulations: 40,
      teams: TEAMS,
      schedule: SCHEDULE,
      rng: mulberry32(2026),
    });
    expect(result.stats).toHaveLength(48);
    for (const s of result.stats) {
      expect(s.p25).toBeLessThanOrEqual(s.median + 1e-9);
      expect(s.median).toBeLessThanOrEqual(s.p75 + 1e-9);
      expect(s.min).toBeLessThanOrEqual(s.max);
    }
  });
});
