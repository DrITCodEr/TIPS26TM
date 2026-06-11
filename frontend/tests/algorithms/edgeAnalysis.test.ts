import { describe, expect, it } from "vitest";
import { runMonteCarlo } from "@/lib/algorithms/monteCarlo";
import {
  calculateMatchEdges,
  calculateTitelEdge,
  syntheticMatchProbs,
} from "@/lib/algorithms/edgeAnalysis";
import { TEAMS } from "@/lib/data/teams";
import { SCHEDULE } from "@/lib/data/schedule";
import { MARKT_QUOTEN } from "@/lib/data/marktQuoten";
import { PRESETS } from "@/lib/data/presets";
import { mulberry32 } from "@/lib/algorithms/random";

describe("syntheticMatchProbs", () => {
  it("sums to ~100% for any pairing", () => {
    const { winA, draw, winB } = syntheticMatchProbs(
      "Deutschland", "Curaçao", TEAMS, MARKT_QUOTEN,
    );
    expect(winA + draw + winB).toBeCloseTo(100, 4);
  });

  it("a heavy favorite beats a long-shot most of the time", () => {
    const m = syntheticMatchProbs(
      "Spanien", "Saudi-Arabien", TEAMS, MARKT_QUOTEN,
    );
    expect(m.winA).toBeGreaterThan(m.winB);
    expect(m.winA).toBeGreaterThan(70);
  });

  it("is symmetric in win swap", () => {
    const a = syntheticMatchProbs("Spanien", "Brasilien", TEAMS, MARKT_QUOTEN);
    const b = syntheticMatchProbs("Brasilien", "Spanien", TEAMS, MARKT_QUOTEN);
    expect(a.winA).toBeCloseTo(b.winB, 6);
    expect(a.winB).toBeCloseTo(b.winA, 6);
    expect(a.draw).toBeCloseTo(b.draw, 6);
  });
});

describe("calculateTitelEdge", () => {
  it("returns edges that sum sim - markt = edge per team", async () => {
    const sim = await runMonteCarlo({
      algorithm: "v2",
      weights: PRESETS.default,
      numSimulations: 200,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      rng: mulberry32(11),
    });
    const edges = calculateTitelEdge(sim, TEAMS, MARKT_QUOTEN);
    expect(edges.length).toBeGreaterThan(0);
    for (const e of edges) {
      expect(e.edge).toBeCloseTo(e.simP - e.marktP, 6);
      expect(e.absEdge).toBeCloseTo(Math.abs(e.edge), 6);
    }
  });

  it("returns edges sorted by |edge| descending", async () => {
    const sim = await runMonteCarlo({
      algorithm: "v1",
      weights: PRESETS.default,
      numSimulations: 200,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      rng: mulberry32(12),
    });
    const edges = calculateTitelEdge(sim, TEAMS, MARKT_QUOTEN);
    for (let i = 1; i < edges.length; i++) {
      expect(edges[i - 1].absEdge).toBeGreaterThanOrEqual(edges[i].absEdge);
    }
  });
});

describe("calculateMatchEdges", () => {
  it("returns one entry per scheduled match", async () => {
    const sim = await runMonteCarlo({
      algorithm: "v1",
      weights: PRESETS.default,
      numSimulations: 100,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      rng: mulberry32(13),
    });
    const edges = calculateMatchEdges(sim, TEAMS, SCHEDULE, MARKT_QUOTEN);
    expect(edges).toHaveLength(SCHEDULE.length);
    for (const e of edges) {
      expect(e.maxAbsEdge).toBe(
        Math.max(Math.abs(e.edgeWinA), Math.abs(e.edgeDraw), Math.abs(e.edgeWinB)),
      );
      expect(e.simWinA + e.simDraw + e.simWinB).toBeCloseTo(100, 4);
    }
  });
});
