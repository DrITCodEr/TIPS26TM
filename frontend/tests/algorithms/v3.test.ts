import { describe, expect, it } from "vitest";
import {
  calculateStrengths_v3,
  computePlayerComposite,
} from "@/lib/algorithms/tips26v3";
import { calculateStrengths_v2 } from "@/lib/algorithms/tips26v2";
import { TEAMS } from "@/lib/data/teams";
import { MARKT_QUOTEN } from "@/lib/data/marktQuoten";
import { PLAYER_AGGREGATES } from "@/lib/data/playerAggregates";
import { PRESETS } from "@/lib/data/presets";

describe("computePlayerComposite", () => {
  it("returns one value per team in [0, 1]", () => {
    const c = computePlayerComposite(TEAMS, PLAYER_AGGREGATES);
    expect(c).toHaveLength(TEAMS.length);
    for (const v of c) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("ranks Spanien, Frankreich, England near the top", () => {
    const c = computePlayerComposite(TEAMS, PLAYER_AGGREGATES);
    const ranked = c
      .map((s, i) => ({ name: TEAMS[i].name, s }))
      .sort((a, b) => b.s - a.s);
    const top5 = ranked.slice(0, 5).map((t) => t.name);
    const favs = ["Spanien", "Frankreich", "England", "Brasilien", "Deutschland"];
    const overlap = top5.filter((n) => favs.includes(n));
    expect(overlap.length).toBeGreaterThanOrEqual(3);
  });

  it("tolerates missing player data via averaged fallback", () => {
    // Künstliches Setup: ein Team OHNE Aggregat-Eintrag
    const partial = { ...PLAYER_AGGREGATES };
    delete partial.Deutschland;
    const c = computePlayerComposite(TEAMS, partial);
    const dtIdx = TEAMS.findIndex((t) => t.name === "Deutschland");
    expect(Number.isFinite(c[dtIdx])).toBe(true);
  });
});

describe("PLAYER_AGGREGATES dataset", () => {
  it("covers every team in TEAMS", () => {
    for (const t of TEAMS) {
      expect(PLAYER_AGGREGATES[t.name]).toBeDefined();
    }
  });

  it("has plausible value ranges", () => {
    for (const t of TEAMS) {
      const a = PLAYER_AGGREGATES[t.name];
      expect(a.top11Markt).toBeGreaterThanOrEqual(0);
      expect(a.pctTop5Ligen).toBeGreaterThanOrEqual(0);
      expect(a.pctTop5Ligen).toBeLessThanOrEqual(1);
      expect(a.uclSpieler).toBeGreaterThanOrEqual(0);
      expect(a.uclSpieler).toBeLessThanOrEqual(23);
      expect(a.xgAttacke).toBeGreaterThanOrEqual(0.3);
      expect(a.xgAttacke).toBeLessThanOrEqual(3);
      expect(a.xgaDefense).toBeGreaterThanOrEqual(0.3);
      expect(a.xgaDefense).toBeLessThanOrEqual(3);
      expect(a.gkPsxg).toBeGreaterThanOrEqual(0.5);
      expect(a.gkPsxg).toBeLessThanOrEqual(0.85);
    }
  });
});

describe("calculateStrengths_v3", () => {
  it("returns one strength per team", () => {
    const s = calculateStrengths_v3(
      TEAMS,
      PRESETS.default,
      MARKT_QUOTEN,
      PLAYER_AGGREGATES,
    );
    expect(s).toHaveLength(TEAMS.length);
  });

  it("differs from v2 because the player composite is blended in", () => {
    const v2 = calculateStrengths_v2(TEAMS, PRESETS.default, MARKT_QUOTEN);
    const v3 = calculateStrengths_v3(
      TEAMS,
      PRESETS.default,
      MARKT_QUOTEN,
      PLAYER_AGGREGATES,
    );
    let differs = 0;
    for (let i = 0; i < TEAMS.length; i++) {
      if (Math.abs(v2[i] - v3[i]) > 1e-6) differs++;
    }
    expect(differs).toBeGreaterThan(40);
  });

  it("ranks Spanien / Frankreich / England in the top-3", () => {
    const s = calculateStrengths_v3(
      TEAMS,
      PRESETS.default,
      MARKT_QUOTEN,
      PLAYER_AGGREGATES,
    );
    const top3 = s
      .map((str, i) => ({ name: TEAMS[i].name, s: str }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((t) => t.name);
    const favs = ["Spanien", "Frankreich", "England"];
    const overlap = top3.filter((n) => favs.includes(n));
    expect(overlap.length).toBeGreaterThanOrEqual(2);
  });
});
