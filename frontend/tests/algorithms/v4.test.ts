import { describe, expect, it } from "vitest";
import {
  calculateStrengths_v4,
  DEFAULT_ENSEMBLE_WEIGHTS,
} from "@/lib/algorithms/tips26v4";
import { calculateStrengths_v1 } from "@/lib/algorithms/tips26v1";
import { calculateStrengths_v2 } from "@/lib/algorithms/tips26v2";
import { calculateStrengths_v3 } from "@/lib/algorithms/tips26v3";
import { TEAMS } from "@/lib/data/teams";
import { MARKT_QUOTEN } from "@/lib/data/marktQuoten";
import { PLAYER_AGGREGATES } from "@/lib/data/playerAggregates";
import { PRESETS } from "@/lib/data/presets";

describe("calculateStrengths_v4 (ensemble stacker)", () => {
  it("returns one strength per team", () => {
    const s = calculateStrengths_v4(
      TEAMS,
      PRESETS.default,
      MARKT_QUOTEN,
      PLAYER_AGGREGATES,
    );
    expect(s).toHaveLength(TEAMS.length);
  });

  it("equals the weighted blend of v1/v2/v3", () => {
    const v1 = calculateStrengths_v1(TEAMS, PRESETS.default);
    const v2 = calculateStrengths_v2(TEAMS, PRESETS.default, MARKT_QUOTEN);
    const v3 = calculateStrengths_v3(
      TEAMS,
      PRESETS.default,
      MARKT_QUOTEN,
      PLAYER_AGGREGATES,
    );
    const v4 = calculateStrengths_v4(
      TEAMS,
      PRESETS.default,
      MARKT_QUOTEN,
      PLAYER_AGGREGATES,
    );
    const w = DEFAULT_ENSEMBLE_WEIGHTS;
    const sum = w.v1 + w.v2 + w.v3;
    for (let i = 0; i < TEAMS.length; i++) {
      const expected = (w.v1 * v1[i] + w.v2 * v2[i] + w.v3 * v3[i]) / sum;
      expect(v4[i]).toBeCloseTo(expected, 10);
    }
  });

  it("respects custom ensemble weights", () => {
    const onlyV2 = calculateStrengths_v4(
      TEAMS,
      PRESETS.default,
      MARKT_QUOTEN,
      PLAYER_AGGREGATES,
      { v1: 0, v2: 1, v3: 0 },
    );
    const v2 = calculateStrengths_v2(TEAMS, PRESETS.default, MARKT_QUOTEN);
    for (let i = 0; i < TEAMS.length; i++) {
      expect(onlyV2[i]).toBeCloseTo(v2[i], 10);
    }
  });

  it("ranks Spanien / Frankreich / England / Brasilien in the top-5", () => {
    const s = calculateStrengths_v4(
      TEAMS,
      PRESETS.default,
      MARKT_QUOTEN,
      PLAYER_AGGREGATES,
    );
    const top5 = s
      .map((str, i) => ({ name: TEAMS[i].name, s: str }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 5)
      .map((t) => t.name);
    const favs = ["Spanien", "Frankreich", "England", "Brasilien", "Argentinien"];
    const overlap = top5.filter((n) => favs.includes(n));
    expect(overlap.length).toBeGreaterThanOrEqual(3);
  });
});
