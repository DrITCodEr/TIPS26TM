import { describe, expect, it } from "vitest";
import { calculateStrengths_v1 } from "@/lib/algorithms/tips26v1";
import { calculateStrengths_v2 } from "@/lib/algorithms/tips26v2";
import { TEAMS } from "@/lib/data/teams";
import { MARKT_QUOTEN } from "@/lib/data/marktQuoten";
import { PRESETS } from "@/lib/data/presets";

function topTeams(strengths: number[], n: number): string[] {
  return [...strengths]
    .map((s, i) => ({ name: TEAMS[i].name, s }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((t) => t.name);
}

describe("calculateStrengths_v1 (Classic)", () => {
  it("returns one strength per team", () => {
    const s = calculateStrengths_v1(TEAMS, PRESETS.default);
    expect(s).toHaveLength(48);
  });

  it("ELO-only preset ranks Frankreich/Spanien at the top (highest ELO)", () => {
    const eloOnly = {
      elo: 100, fifa: 0, markt: 0, form: 0, heim: 0,
      wmHF: 0, trainer: 0, star: 0, hoehe: 0,
    };
    const s = calculateStrengths_v1(TEAMS, eloOnly);
    const top2 = topTeams(s, 2);
    expect(top2).toEqual(expect.arrayContaining(["Frankreich", "Spanien"]));
  });

  it("default preset has top-5 inside the research consensus", () => {
    const s = calculateStrengths_v1(TEAMS, PRESETS.default);
    const top5 = topTeams(s, 5);
    const consensus = [
      "Spanien", "Frankreich", "England", "Brasilien", "Argentinien",
      "Portugal", "Deutschland", "Niederlande",
    ];
    const overlap = top5.filter((n) => consensus.includes(n));
    expect(overlap.length).toBeGreaterThanOrEqual(4);
  });

  it("all weights zero → fallback divisor = 1, no NaN", () => {
    const zero = {
      elo: 0, fifa: 0, markt: 0, form: 0, heim: 0,
      wmHF: 0, trainer: 0, star: 0, hoehe: 0,
    };
    const s = calculateStrengths_v1(TEAMS, zero);
    for (const v of s) {
      expect(Number.isFinite(v)).toBe(true);
    }
  });
});

describe("calculateStrengths_v2 (Advanced)", () => {
  it("returns one strength per team", () => {
    const s = calculateStrengths_v2(TEAMS, PRESETS.default, MARKT_QUOTEN);
    expect(s).toHaveLength(48);
  });

  it("top-5 with default preset matches the bookmaker favorites", () => {
    const s = calculateStrengths_v2(TEAMS, PRESETS.default, MARKT_QUOTEN);
    const top5 = topTeams(s, 5);
    const favs = ["Spanien", "Frankreich", "England", "Brasilien", "Argentinien"];
    const overlap = top5.filter((n) => favs.includes(n));
    expect(overlap.length).toBeGreaterThanOrEqual(4);
  });

  it("v2 incorporates the market signal (mutating market quotes changes the result)", () => {
    const base = calculateStrengths_v2(TEAMS, PRESETS.default, MARKT_QUOTEN);

    // Heftig anders: Spanien wird vom Markt zum Underdog
    const perturbed = { ...MARKT_QUOTEN, Spanien: 200.0 };
    const after = calculateStrengths_v2(TEAMS, PRESETS.default, perturbed);

    const spainIdx = TEAMS.findIndex((t) => t.name === "Spanien");
    expect(after[spainIdx]).toBeLessThan(base[spainIdx]);
  });

  it("v2 with default preset puts the top market favorites at the top of the strengths", () => {
    // Frankreich und Spanien teilen sich praktisch den ELO-Spitzenplatz
    // (2090 vs 2085) und führen auch die Markt-Quoten an. Beide MÜSSEN
    // unter den Top-2 v2-Stärken landen.
    const s = calculateStrengths_v2(TEAMS, PRESETS.default, MARKT_QUOTEN);
    expect(topTeams(s, 2).sort()).toEqual(["Frankreich", "Spanien"].sort());
  });
});
