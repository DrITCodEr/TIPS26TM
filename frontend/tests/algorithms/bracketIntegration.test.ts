import { describe, expect, it } from "vitest";
import { resolveR32 } from "@/lib/algorithms/fifaBracket";
import { R16_ROUND, QF_ROUND, R32_MATCHES } from "@/lib/data/koBracket";
import { TEAMS } from "@/lib/data/teams";
import type { GroupName } from "@/lib/types/team";

/**
 * End-to-End: das FIFA-Bracket muss garantieren, dass Deutschland (Gruppe E)
 * je nach Platz 1 vs Platz 2 einen anderen R32-Slot, andere R16/QF-Pfade
 * erhält — die "Wenn-Dann-Wege" aus dem DFB-Tab werden damit echt.
 */
describe("FIFA bracket integration — Deutschland-Pfade", () => {
  // Helper: minimaler GroupSorted-Aufbau, wo wir den DFB-Platz frei wählen
  function syntheticGroupSorted(
    dfbPosition: 1 | 2,
  ): { groups: Record<GroupName, number[]>; dfbIdx: number } {
    const dfbIdx = TEAMS.findIndex((t) => t.name === "Deutschland");
    const groups = {} as Record<GroupName, number[]>;
    // Jede Gruppe bekommt 4 generische Indizes; in Gruppe E platzieren wir
    // dfbIdx auf der gewünschten Position
    const usedIds = new Set<number>([dfbIdx]);
    let nextId = 100;
    const fakeId = () => {
      while (usedIds.has(nextId)) nextId++;
      const v = nextId;
      usedIds.add(v);
      return v;
    };
    const ALL_GROUPS: GroupName[] = [
      "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
    ];
    for (const g of ALL_GROUPS) {
      const slots = [fakeId(), fakeId(), fakeId(), fakeId()];
      if (g === "E") {
        slots[dfbPosition - 1] = dfbIdx;
      }
      groups[g] = slots;
    }
    return { groups, dfbIdx };
  }

  it("DFB als Gruppensieger landet im R32-Match von Slot 1E", () => {
    const { groups, dfbIdx } = syntheticGroupSorted(1);
    const bestThirds = (
      ["A", "B", "C", "D", "F", "G", "H", "I"] as GroupName[]
    ).map((g) => ({ group: g, idx: groups[g][2] }));

    const { matches } = resolveR32(groups, bestThirds);

    // Finde das Match in dem DFB steckt
    const dfbMatch = matches.findIndex((p) => p.includes(dfbIdx));
    expect(dfbMatch).toBeGreaterThanOrEqual(0);

    // R32_MATCHES[dfbMatch] muss einen "groupWinner Gruppe E"-Slot haben
    const [slotA, slotB] = R32_MATCHES[dfbMatch];
    const isE =
      (slotA.type === "groupWinner" && slotA.group === "E") ||
      (slotB.type === "groupWinner" && slotB.group === "E");
    expect(isE).toBe(true);
  });

  it("DFB als Gruppenzweiter landet im R32-Match von Slot 2E", () => {
    const { groups, dfbIdx } = syntheticGroupSorted(2);
    const bestThirds = (
      ["A", "B", "C", "D", "F", "G", "H", "I"] as GroupName[]
    ).map((g) => ({ group: g, idx: groups[g][2] }));

    const { matches } = resolveR32(groups, bestThirds);
    const dfbMatch = matches.findIndex((p) => p.includes(dfbIdx));
    const [slotA, slotB] = R32_MATCHES[dfbMatch];
    const isE2 =
      (slotA.type === "groupRunnerUp" && slotA.group === "E") ||
      (slotB.type === "groupRunnerUp" && slotB.group === "E");
    expect(isE2).toBe(true);
  });

  it("DFB Platz 1 und Platz 2 landen in unterschiedlichen R16-Matches", () => {
    const thirds = (["A", "B", "C", "D", "F", "G", "H", "I"] as GroupName[]).map((g) => ({
      group: g,
      idx: 1000 + "ABCDEFGHIJKL".indexOf(g),
    }));

    const p1 = syntheticGroupSorted(1);
    const p2 = syntheticGroupSorted(2);
    const r1 = resolveR32(p1.groups, thirds.map((t) => ({ ...t, idx: p1.groups[t.group][2] })));
    const r2 = resolveR32(p2.groups, thirds.map((t) => ({ ...t, idx: p2.groups[t.group][2] })));

    const dfbR32_p1 = r1.matches.findIndex((p) => p.includes(p1.dfbIdx));
    const dfbR32_p2 = r2.matches.findIndex((p) => p.includes(p2.dfbIdx));

    // Welches R16-Match wird gefüttert?
    const r16For = (r32MatchIdx: number) =>
      R16_ROUND.feeders.findIndex(([a, b]) => a === r32MatchIdx || b === r32MatchIdx);

    expect(r16For(dfbR32_p1)).not.toBe(r16For(dfbR32_p2));
  });

  it("alle 8 R16-Matches erhalten genau 2 R32-Feeder", () => {
    expect(R16_ROUND.feeders).toHaveLength(8);
    const used = new Set<number>();
    for (const [a, b] of R16_ROUND.feeders) {
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThan(16);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThan(16);
      expect(a).not.toBe(b);
      used.add(a);
      used.add(b);
    }
    expect(used.size).toBe(16);
  });

  it("alle 4 QF-Matches erhalten genau 2 R16-Feeder", () => {
    expect(QF_ROUND.feeders).toHaveLength(4);
    const used = new Set<number>();
    for (const [a, b] of QF_ROUND.feeders) {
      used.add(a);
      used.add(b);
    }
    expect(used.size).toBe(8);
  });
});
