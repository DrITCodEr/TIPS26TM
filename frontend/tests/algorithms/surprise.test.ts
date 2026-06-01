import { describe, expect, it } from "vitest";
import { runMonteCarlo } from "@/lib/algorithms/monteCarlo";
import { simulateMatch } from "@/lib/algorithms/index";
import { TEAMS } from "@/lib/data/teams";
import { SCHEDULE } from "@/lib/data/schedule";
import { MARKT_QUOTEN } from "@/lib/data/marktQuoten";
import { PLAYER_AGGREGATES } from "@/lib/data/playerAggregates";
import { PRESETS } from "@/lib/data/presets";
import { mulberry32 } from "@/lib/algorithms/random";

describe("surpriseSigma is opt-in", () => {
  it("simulateMatch with sigma=0 is identical to no sigma argument (same seed)", () => {
    const a = simulateMatch("v2", 0.7, 0.4, mulberry32(42), 0);
    const b = simulateMatch("v2", 0.7, 0.4, mulberry32(42));
    expect(a).toEqual(b);
  });

  it("simulateMatch with sigma>0 spreads results (perturbs strengths)", () => {
    // Bei sehr großer Stärken-Differenz dominiert A. Mit hohem sigma sollten
    // gelegentlich Überraschungen vorkommen — d.h. mehr B-Siege.
    const N = 3000;
    let bWinsZero = 0;
    let bWinsHigh = 0;
    const rng1 = mulberry32(1);
    const rng2 = mulberry32(2);
    for (let i = 0; i < N; i++) {
      const r0 = simulateMatch("v2", 0.85, 0.25, rng1, 0);
      const rH = simulateMatch("v2", 0.85, 0.25, rng2, 0.3);
      if (r0.toreB > r0.toreA) bWinsZero++;
      if (rH.toreB > rH.toreA) bWinsHigh++;
    }
    expect(bWinsHigh).toBeGreaterThan(bWinsZero);
  });
});

describe("runMonteCarlo with surpriseSigma", () => {
  it("sigma=0 produces identical results to default (same seed)", async () => {
    const cfg = {
      algorithm: "v2" as const,
      weights: PRESETS.default,
      numSimulations: 100,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      playerAggregates: PLAYER_AGGREGATES,
    };
    const a = await runMonteCarlo({ ...cfg, rng: mulberry32(7), surpriseSigma: 0 });
    const b = await runMonteCarlo({ ...cfg, rng: mulberry32(7) });
    expect(a.stats.map((s) => s.titel)).toEqual(b.stats.map((s) => s.titel));
  });

  it("sigma=0.3 produces a flatter title distribution than sigma=0", async () => {
    const cfg = {
      algorithm: "v2" as const,
      weights: PRESETS.default,
      numSimulations: 600,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      playerAggregates: PLAYER_AGGREGATES,
    };
    const flat = await runMonteCarlo({
      ...cfg,
      rng: mulberry32(1001),
      surpriseSigma: 0.3,
    });
    const sharp = await runMonteCarlo({
      ...cfg,
      rng: mulberry32(1002),
      surpriseSigma: 0,
    });

    // Top-Team-Anteil: hoher Surprise sollte den Spitzen-Anteil reduzieren
    const topFlat = Math.max(...flat.stats.map((s) => s.titel)) / flat.numSimulations;
    const topSharp = Math.max(...sharp.stats.map((s) => s.titel)) / sharp.numSimulations;
    expect(topFlat).toBeLessThan(topSharp);
  });
});
