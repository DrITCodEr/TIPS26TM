import { describe, expect, it } from "vitest";
import { SCHEDULE } from "@/lib/data/schedule";
import { TEAMS } from "@/lib/data/teams";

describe("SCHEDULE", () => {
  it("has exactly 72 group-stage matches", () => {
    expect(SCHEDULE).toHaveLength(72);
  });

  it("every match references resolved team indices", () => {
    for (const m of SCHEDULE) {
      expect(typeof m.idxA).toBe("number");
      expect(typeof m.idxB).toBe("number");
      expect(m.idxA).not.toBe(m.idxB);
    }
  });

  it("every team appears in exactly 3 matches (round-robin per group)", () => {
    const counts = new Array(TEAMS.length).fill(0);
    for (const m of SCHEDULE) {
      counts[m.idxA!]++;
      counts[m.idxB!]++;
    }
    for (let i = 0; i < TEAMS.length; i++) {
      expect(counts[i]).toBe(3);
    }
  });

  it("both teams of each match are in the same group", () => {
    for (const m of SCHEDULE) {
      expect(TEAMS[m.idxA!].group).toBe(m.group);
      expect(TEAMS[m.idxB!].group).toBe(m.group);
    }
  });

  it("each group has exactly 6 matches (4 teams round-robin = C(4,2) = 6)", () => {
    const perGroup: Record<string, number> = {};
    for (const m of SCHEDULE) {
      perGroup[m.group] = (perGroup[m.group] ?? 0) + 1;
    }
    for (const g of Object.keys(perGroup)) {
      expect(perGroup[g]).toBe(6);
    }
  });
});
