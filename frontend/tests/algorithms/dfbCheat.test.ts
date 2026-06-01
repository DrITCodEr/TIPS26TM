import { describe, expect, it } from "vitest";
import { runMonteCarlo } from "@/lib/algorithms/monteCarlo";
import { TEAMS } from "@/lib/data/teams";
import { SCHEDULE } from "@/lib/data/schedule";
import { MARKT_QUOTEN } from "@/lib/data/marktQuoten";
import { PLAYER_AGGREGATES } from "@/lib/data/playerAggregates";
import { PRESETS } from "@/lib/data/presets";
import { mulberry32 } from "@/lib/algorithms/random";

const DFB_IDX = TEAMS.findIndex((t) => t.name === "Deutschland");

describe("DFB Cheat-Mode", () => {
  it("Deutschland wins every group match deterministically when toggle is on", async () => {
    const result = await runMonteCarlo({
      algorithm: "v2",
      weights: PRESETS.default,
      numSimulations: 50,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      playerAggregates: PLAYER_AGGREGATES,
      rng: mulberry32(1),
      dfbAlwaysWins: true,
    });

    // Pro DFB-Match (3 in der Gruppenphase) sollten alle 50 Sims winA oder winB
    // für DFB sein (3:0 deterministisch).
    for (let i = 0; i < SCHEDULE.length; i++) {
      const m = SCHEDULE[i];
      const isDfbMatch = m.teamA === "Deutschland" || m.teamB === "Deutschland";
      if (!isDfbMatch) continue;
      const ms = result.matchStats[i];
      const dfbIsHome = m.teamA === "Deutschland";
      const dfbWins = dfbIsHome ? ms.winA : ms.winB;
      expect(dfbWins).toBe(50);
      expect(ms.draw).toBe(0);
      // Score sollte ausschließlich "3-0" / "0-3" sein
      const scores = Object.entries(ms.scores);
      expect(scores).toHaveLength(1);
      const [score, count] = scores[0];
      expect(count).toBe(50);
      expect(score).toBe(dfbIsHome ? "3-0" : "0-3");
    }
  });

  it("Deutschland wins title in 100 % of sims when cheat is on", async () => {
    const result = await runMonteCarlo({
      algorithm: "v2",
      weights: PRESETS.default,
      numSimulations: 50,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      playerAggregates: PLAYER_AGGREGATES,
      rng: mulberry32(2),
      dfbAlwaysWins: true,
    });
    expect(result.stats[DFB_IDX].titel).toBe(50);
    expect(result.stats[DFB_IDX].finale).toBe(50);
    expect(result.stats[DFB_IDX].hf).toBe(50);
    expect(result.stats[DFB_IDX].vf).toBe(50);
    expect(result.stats[DFB_IDX].achtel).toBe(50);
  });

  it("dfbAlwaysWins=false is identical to default (backward compat)", async () => {
    const cfg = {
      algorithm: "v2" as const,
      weights: PRESETS.default,
      numSimulations: 60,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      playerAggregates: PLAYER_AGGREGATES,
    };
    const a = await runMonteCarlo({ ...cfg, rng: mulberry32(7), dfbAlwaysWins: false });
    const b = await runMonteCarlo({ ...cfg, rng: mulberry32(7) });
    expect(a.stats.map((s) => s.titel)).toEqual(b.stats.map((s) => s.titel));
  });

  // Anmerkung: nicht-DFB-Matches sind unter cheat=true geringfügig anders
  // als unter cheat=false (gleicher Seed), weil DFB-Matches keine RNG-
  // Aufrufe machen — der Stream der anderen Matches verschiebt sich. Das
  // ist erwartet und kein Bug.
});
