import { describe, expect, it } from "vitest";
import { TEAMS, TEAM_IDX_BY_NAME } from "@/lib/data/teams";

describe("TEAMS dataset", () => {
  it("has exactly 48 teams", () => {
    expect(TEAMS).toHaveLength(48);
  });

  it("groups A–L each have exactly 4 teams", () => {
    const counts: Record<string, number> = {};
    for (const t of TEAMS) {
      counts[t.group] = (counts[t.group] ?? 0) + 1;
    }
    expect(Object.keys(counts).sort()).toEqual([
      "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
    ]);
    for (const g of Object.keys(counts)) {
      expect(counts[g]).toBe(4);
    }
  });

  it("team names are unique", () => {
    const names = new Set(TEAMS.map((t) => t.name));
    expect(names.size).toBe(48);
  });

  it("TEAM_IDX_BY_NAME resolves every team", () => {
    for (let i = 0; i < TEAMS.length; i++) {
      expect(TEAM_IDX_BY_NAME[TEAMS[i].name]).toBe(i);
    }
  });

  it("home-advantage flag is set for hosts USA / Mexiko / Kanada", () => {
    expect(TEAMS.find((t) => t.name === "USA")?.heim).toBe(1);
    expect(TEAMS.find((t) => t.name === "Mexiko")?.heim).toBe(1);
    expect(TEAMS.find((t) => t.name === "Kanada")?.heim).toBe(1);
  });

  it("Deutschland is in group E with the prototype-listed neighbors", () => {
    const groupE = TEAMS.filter((t) => t.group === "E").map((t) => t.name);
    expect(groupE).toEqual(
      expect.arrayContaining(["Deutschland", "Curaçao", "Elfenbeink.", "Ecuador"]),
    );
  });
});
