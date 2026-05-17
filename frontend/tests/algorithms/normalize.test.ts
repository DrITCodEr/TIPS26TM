import { describe, expect, it } from "vitest";
import { normalize, normalizeFactor } from "@/lib/algorithms/normalize";
import { TEAMS } from "@/lib/data/teams";

describe("normalize", () => {
  it("maps min to 0 and max to 1", () => {
    const out = normalize([10, 20, 30, 40, 50]);
    expect(out[0]).toBe(0);
    expect(out.at(-1)).toBe(1);
  });

  it("returns 0.5 for a uniform array (range = 0)", () => {
    const out = normalize([7, 7, 7, 7]);
    expect(out).toEqual([0.5, 0.5, 0.5, 0.5]);
  });

  it("preserves linearity", () => {
    const out = normalize([0, 5, 10]);
    expect(out).toEqual([0, 0.5, 1]);
  });

  it("returns [] for empty input", () => {
    expect(normalize([])).toEqual([]);
  });
});

describe("normalizeFactor over real team data", () => {
  it("produces 48 values in [0, 1] for ELO", () => {
    const out = normalizeFactor(TEAMS, "elo");
    expect(out).toHaveLength(48);
    for (const v of out) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("strongest ELO team (Frankreich) is normalized to 1", () => {
    const out = normalizeFactor(TEAMS, "elo");
    const idx = TEAMS.findIndex((t) => t.name === "Frankreich");
    expect(out[idx]).toBe(1);
  });
});
