import type { GroupName } from "@/lib/types/team";
import { R32_MATCHES, type Slot } from "@/lib/data/koBracket";

export interface QualifiedThird {
  /** Team-Index im globalen TEAMS-Array */
  idx: number;
  /** Aus welcher Gruppe der Drittplatzierte stammt */
  group: GroupName;
}

/**
 * Bipartites Perfect-Matching per Backtracking.
 *
 * Eingabe: pro Slot eine Liste erlaubter Gruppen. Ausgabe: für jeden
 * Slot exakt eine Gruppe aus seinen erlaubten Gruppen, sodass jede
 * qualifizierte Gruppe genau einmal vorkommt.
 *
 * Worst case: 8! = 40 320 Versuche. Mit Most-Constrained-First-Heuristik
 * praktisch immer < 100. Für die FIFA-Slot-Regeln existiert per
 * Konstruktion immer ein gültiges Matching.
 *
 * Wir prozessieren Slots in der Reihenfolge ihrer Index-Position, damit
 * das Ergebnis deterministisch bleibt, und versuchen pro Slot die
 * qualifizierten Gruppen in alphabetischer Reihenfolge.
 */
function findThirdAssignment(
  slotAllowedGroups: GroupName[][],
  qualifiedGroups: Set<GroupName>,
): GroupName[] | null {
  const n = slotAllowedGroups.length;
  const assignment = new Array<GroupName | null>(n).fill(null);
  const used = new Set<GroupName>();

  function backtrack(slotIdx: number): boolean {
    if (slotIdx === n) return true;
    const allowed = slotAllowedGroups[slotIdx];
    for (const g of allowed) {
      if (!qualifiedGroups.has(g) || used.has(g)) continue;
      assignment[slotIdx] = g;
      used.add(g);
      if (backtrack(slotIdx + 1)) return true;
      used.delete(g);
      assignment[slotIdx] = null;
    }
    return false;
  }

  return backtrack(0) ? (assignment as GroupName[]) : null;
}

export interface ResolvedR32 {
  /** 16 Paare (idxA, idxB) in M1..M16-Reihenfolge */
  matches: [number, number][];
}

/**
 * Löst die 16 R32-Paarungen aus den Gruppen-Endständen + den 8 besten Dritten.
 *
 *   groupSorted[g] = [idx1.Platz, idx2.Platz, idx3.Platz, idx4.Platz]
 *   bestThirds     = die 8 qualifizierten Drittplatzierten (mit Group-Info)
 *
 * Wirft, wenn keine konsistente FIFA-Slot-Zuordnung möglich ist — sollte in
 * der Praxis nicht passieren (Slot-Regeln sind so konstruiert, dass jede
 * Auswahl von 8 aus 12 Gruppen ein Matching erlaubt).
 */
export function resolveR32(
  groupSorted: Record<GroupName, number[]>,
  bestThirds: QualifiedThird[],
): ResolvedR32 {
  // 1) Sammle die Reihenfolge der bestThird-Slots in R32_MATCHES
  const thirdSlotIndices: number[] = []; // Slot-Position innerhalb der flachen 32-Slot-Liste
  const slotAllowed: GroupName[][] = [];
  for (let mi = 0; mi < R32_MATCHES.length; mi++) {
    const [a, b] = R32_MATCHES[mi];
    if (a.type === "bestThird") {
      thirdSlotIndices.push(mi * 2);
      slotAllowed.push(a.allowedGroups);
    }
    if (b.type === "bestThird") {
      thirdSlotIndices.push(mi * 2 + 1);
      slotAllowed.push(b.allowedGroups);
    }
  }

  // 2) Suche ein zulässiges Matching der 8 qualifizierten Gruppen
  const qualifiedSet = new Set(bestThirds.map((t) => t.group));
  const groupAssignment = findThirdAssignment(slotAllowed, qualifiedSet);
  if (!groupAssignment) {
    throw new Error(
      `FIFA-Bracket: kein gültiges Matching für die 8 Dritten {${[...qualifiedSet].join(", ")}}.`,
    );
  }
  const thirdByGroup = new Map(bestThirds.map((t) => [t.group, t.idx]));

  // 3) Baue 32-Slot-Array auf
  const flatSlots = new Array<number>(32).fill(-1);
  for (let mi = 0; mi < R32_MATCHES.length; mi++) {
    const [a, b] = R32_MATCHES[mi];
    flatSlots[mi * 2] = resolveDirectSlot(a, groupSorted);
    flatSlots[mi * 2 + 1] = resolveDirectSlot(b, groupSorted);
  }
  // bestThird-Slots ersetzen
  for (let i = 0; i < thirdSlotIndices.length; i++) {
    const flatIdx = thirdSlotIndices[i];
    const g = groupAssignment[i];
    const teamIdx = thirdByGroup.get(g);
    if (teamIdx === undefined) {
      throw new Error(`FIFA-Bracket: Gruppe ${g} ohne qualifizierten Dritten?`);
    }
    flatSlots[flatIdx] = teamIdx;
  }

  // 4) In Paare umpacken
  const matches: [number, number][] = [];
  for (let mi = 0; mi < 16; mi++) {
    matches.push([flatSlots[mi * 2], flatSlots[mi * 2 + 1]]);
  }
  return { matches };
}

function resolveDirectSlot(
  slot: Slot,
  groupSorted: Record<GroupName, number[]>,
): number {
  if (slot.type === "groupWinner") return groupSorted[slot.group][0];
  if (slot.type === "groupRunnerUp") return groupSorted[slot.group][1];
  return -1; // bestThird wird separat behandelt
}

/**
 * Für UI-Diagnose: gibt das menschenlesbare Slot-Label (1A, 2C, 3CEFHI, …).
 */
export function slotLabel(slot: Slot): string {
  if (slot.type === "groupWinner") return `1${slot.group}`;
  if (slot.type === "groupRunnerUp") return `2${slot.group}`;
  return slot.label;
}
