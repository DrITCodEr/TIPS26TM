import { describe, expect, it } from "vitest";
import {
  resolveR32,
  type QualifiedThird,
} from "@/lib/algorithms/fifaBracket";
import { R32_MATCHES } from "@/lib/data/koBracket";
import type { GroupName } from "@/lib/types/team";

const ALL_GROUPS: GroupName[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];

/** Helper: synthetisch eine Group-Sorted-Tabelle bauen, in der jeder Slot
 *  einen deterministischen Team-Index trägt:  groupIdx*4 + pos   */
function syntheticGroupSorted(): Record<GroupName, number[]> {
  const out = {} as Record<GroupName, number[]>;
  ALL_GROUPS.forEach((g, gi) => {
    out[g] = [gi * 4 + 0, gi * 4 + 1, gi * 4 + 2, gi * 4 + 3];
  });
  return out;
}

/** Helper: nimmt eine Gruppen-Auswahl und liefert die zugehörigen Dritten. */
function thirdsFor(groups: GroupName[]): QualifiedThird[] {
  return groups.map((g) => ({
    group: g,
    idx: ALL_GROUPS.indexOf(g) * 4 + 2,
  }));
}

describe("R32_MATCHES dataset", () => {
  it("has exactly 16 matches", () => {
    expect(R32_MATCHES).toHaveLength(16);
  });

  it("contains exactly 8 bestThird slots and 24 direct slots", () => {
    let third = 0;
    let direct = 0;
    for (const [a, b] of R32_MATCHES) {
      for (const slot of [a, b]) {
        if (slot.type === "bestThird") third++;
        else direct++;
      }
    }
    expect(third).toBe(8);
    expect(direct).toBe(24);
  });

  it("each of 12 groups appears as both winner and runner-up", () => {
    const winners = new Set<GroupName>();
    const runnerUps = new Set<GroupName>();
    for (const [a, b] of R32_MATCHES) {
      for (const slot of [a, b]) {
        if (slot.type === "groupWinner") winners.add(slot.group);
        if (slot.type === "groupRunnerUp") runnerUps.add(slot.group);
      }
    }
    expect(winners.size).toBe(12);
    expect(runnerUps.size).toBe(12);
  });
});

describe("resolveR32 — happy path", () => {
  it("returns 16 unique pairings for the default qualification", () => {
    // Beispiel-Auswahl: Dritte aus A, B, C, D, E, F, G, H
    const groups = syntheticGroupSorted();
    const thirds = thirdsFor(["A", "B", "C", "D", "E", "F", "G", "H"]);
    const { matches } = resolveR32(groups, thirds);

    expect(matches).toHaveLength(16);
    const allTeams = matches.flat();
    expect(new Set(allTeams).size).toBe(32);
    for (const idx of allTeams) {
      expect(idx).toBeGreaterThanOrEqual(0);
    }
  });

  it("produces deterministic output for the same input", () => {
    const groups = syntheticGroupSorted();
    const thirds = thirdsFor(["A", "B", "C", "D", "E", "F", "G", "H"]);
    const a = resolveR32(groups, thirds);
    const b = resolveR32(groups, thirds);
    expect(a.matches).toEqual(b.matches);
  });

  it("places each best third in a slot whose allowedGroups contains its group", () => {
    const groups = syntheticGroupSorted();
    const thirds = thirdsFor(["A", "C", "E", "G", "I", "K", "B", "D"]);
    const { matches } = resolveR32(groups, thirds);

    // Welche Indizes sind die Dritten? (groupIdx * 4 + 2)
    const thirdIdxToGroup = new Map<number, GroupName>();
    for (const t of thirds) thirdIdxToGroup.set(t.idx, t.group);

    // Für jeden Slot in R32_MATCHES: falls type bestThird, muss der dort
    // platzierte Team-Index aus einer erlaubten Gruppe stammen.
    for (let mi = 0; mi < R32_MATCHES.length; mi++) {
      const [slotA, slotB] = R32_MATCHES[mi];
      const [idxA, idxB] = matches[mi];
      if (slotA.type === "bestThird") {
        const g = thirdIdxToGroup.get(idxA);
        expect(g).toBeDefined();
        expect(slotA.allowedGroups).toContain(g);
      }
      if (slotB.type === "bestThird") {
        const g = thirdIdxToGroup.get(idxB);
        expect(g).toBeDefined();
        expect(slotB.allowedGroups).toContain(g);
      }
    }
  });

  it("group winners and runners-up land in their fixed slots", () => {
    const groups = syntheticGroupSorted();
    const thirds = thirdsFor(["A", "B", "C", "D", "E", "F", "G", "H"]);
    const { matches } = resolveR32(groups, thirds);

    for (let mi = 0; mi < R32_MATCHES.length; mi++) {
      const [slotA, slotB] = R32_MATCHES[mi];
      const [idxA, idxB] = matches[mi];
      if (slotA.type === "groupWinner") {
        expect(idxA).toBe(groups[slotA.group][0]);
      }
      if (slotA.type === "groupRunnerUp") {
        expect(idxA).toBe(groups[slotA.group][1]);
      }
      if (slotB.type === "groupWinner") {
        expect(idxB).toBe(groups[slotB.group][0]);
      }
      if (slotB.type === "groupRunnerUp") {
        expect(idxB).toBe(groups[slotB.group][1]);
      }
    }
  });
});

describe("resolveR32 — coverage over many third-team selections", () => {
  it("succeeds for 30 random selections of 8 thirds out of 12 groups", () => {
    let rngState = 1234567;
    const next = () => {
      rngState = (rngState * 1103515245 + 12345) & 0x7fffffff;
      return rngState / 0x7fffffff;
    };

    for (let trial = 0; trial < 30; trial++) {
      const shuffled = [...ALL_GROUPS].sort(() => next() - 0.5);
      const selected = shuffled.slice(0, 8) as GroupName[];
      const groups = syntheticGroupSorted();
      const thirds = thirdsFor(selected);
      const { matches } = resolveR32(groups, thirds);
      expect(matches).toHaveLength(16);
      expect(new Set(matches.flat()).size).toBe(32);
    }
  });
});
