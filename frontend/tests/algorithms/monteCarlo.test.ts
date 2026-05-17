import { describe, expect, it } from "vitest";
import { runMonteCarlo } from "@/lib/algorithms/monteCarlo";
import { TEAMS } from "@/lib/data/teams";
import { SCHEDULE } from "@/lib/data/schedule";
import { MARKT_QUOTEN } from "@/lib/data/marktQuoten";
import { PRESETS } from "@/lib/data/presets";
import { mulberry32 } from "@/lib/algorithms/random";

describe("runMonteCarlo (small-N smoke tests)", () => {
  it("v1: 200 sims with default preset puts a known favorite on top", async () => {
    const result = await runMonteCarlo({
      algorithm: "v1",
      weights: PRESETS.default,
      numSimulations: 200,
      teams: TEAMS,
      schedule: SCHEDULE,
      rng: mulberry32(2026),
    });

    expect(result.stats).toHaveLength(48);
    expect(result.matchStats).toHaveLength(72);
    expect(result.groupRankStats).toHaveLength(48);

    const ranked = result.stats
      .map((s, i) => ({ name: TEAMS[i].name, titel: s.titel }))
      .sort((a, b) => b.titel - a.titel);
    const top5 = ranked.slice(0, 5).map((t) => t.name);

    const favs = [
      "Spanien", "Frankreich", "England", "Brasilien", "Argentinien",
      "Portugal", "Deutschland", "Niederlande",
    ];
    const overlap = top5.filter((n) => favs.includes(n));
    expect(overlap.length).toBeGreaterThanOrEqual(3);
  });

  it("v2: 200 sims with default preset and market quotes works", async () => {
    const result = await runMonteCarlo({
      algorithm: "v2",
      weights: PRESETS.default,
      numSimulations: 200,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      rng: mulberry32(2026),
    });

    expect(result.stats).toHaveLength(48);
    const totalChampions = result.stats.reduce((s, t) => s + t.titel, 0);
    expect(totalChampions).toBe(200);
  });

  it("groupRankStats sum to numSimulations per team (every team is ranked in its group)", async () => {
    const result = await runMonteCarlo({
      algorithm: "v1",
      weights: PRESETS.default,
      numSimulations: 100,
      teams: TEAMS,
      schedule: SCHEDULE,
      rng: mulberry32(1),
    });
    for (let i = 0; i < TEAMS.length; i++) {
      const sum = result.groupRankStats[i].reduce((a, b) => a + b, 0);
      expect(sum).toBe(100);
    }
  });

  it("matchStats: winA + draw + winB == numSimulations for every match", async () => {
    const result = await runMonteCarlo({
      algorithm: "v2",
      weights: PRESETS.default,
      numSimulations: 100,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      rng: mulberry32(2),
    });
    for (const ms of result.matchStats) {
      expect(ms.winA + ms.draw + ms.winB).toBe(100);
    }
  });

  it("emits onProgress callbacks ending at 1.0", async () => {
    const progressValues: number[] = [];
    await runMonteCarlo({
      algorithm: "v1",
      weights: PRESETS.default,
      numSimulations: 100,
      teams: TEAMS,
      schedule: SCHEDULE,
      rng: mulberry32(3),
      onProgress: (p) => progressValues.push(p),
    });
    expect(progressValues.length).toBeGreaterThan(0);
    expect(progressValues.at(-1)).toBe(1);
    for (const p of progressValues) {
      expect(p).toBeGreaterThan(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });

  it("is deterministic with the same seed", async () => {
    const cfg = {
      algorithm: "v1" as const,
      weights: PRESETS.default,
      numSimulations: 50,
      teams: TEAMS,
      schedule: SCHEDULE,
    };
    const a = await runMonteCarlo({ ...cfg, rng: mulberry32(7) });
    const b = await runMonteCarlo({ ...cfg, rng: mulberry32(7) });
    expect(a.stats.map((s) => s.titel)).toEqual(b.stats.map((s) => s.titel));
  });
});
