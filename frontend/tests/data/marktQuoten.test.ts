import { describe, expect, it } from "vitest";
import { MARKT_MARGIN, MARKT_QUOTEN } from "@/lib/data/marktQuoten";
import { TEAMS } from "@/lib/data/teams";

describe("MARKT_QUOTEN", () => {
  it("has a quote for every team", () => {
    for (const t of TEAMS) {
      expect(MARKT_QUOTEN[t.name]).toBeDefined();
      expect(typeof MARKT_QUOTEN[t.name]).toBe("number");
      expect(MARKT_QUOTEN[t.name]).toBeGreaterThan(1);
    }
  });

  it("Spanien is the shortest priced (top favorite)", () => {
    const sorted = Object.entries(MARKT_QUOTEN).sort(
      ([, a], [, b]) => a - b,
    );
    expect(sorted[0][0]).toBe("Spanien");
  });

  it("Curaçao is the longest priced (biggest underdog)", () => {
    const sorted = Object.entries(MARKT_QUOTEN).sort(
      ([, a], [, b]) => b - a,
    );
    expect(sorted[0][0]).toBe("Curaçao");
  });

  it("MARKT_MARGIN reflects an overround around 1.0–1.3", () => {
    expect(MARKT_MARGIN).toBeGreaterThan(1.0);
    expect(MARKT_MARGIN).toBeLessThan(1.5);
  });
});
