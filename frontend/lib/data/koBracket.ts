import type { GroupName } from "@/lib/types/team";

/**
 * Slot-Typen für die K.o.-Phase 2026.
 *
 *   groupWinner    — Gruppensieger einer bestimmten Gruppe (1A..1L)
 *   groupRunnerUp  — Gruppenzweiter (2A..2L)
 *   bestThird      — einer der 8 besten Drittplatzierten, dessen Gruppe in
 *                    der erlaubten Liste enthalten ist (z.B. 3ABCDF)
 */
export type Slot =
  | { type: "groupWinner"; group: GroupName }
  | { type: "groupRunnerUp"; group: GroupName }
  | { type: "bestThird"; allowedGroups: GroupName[]; label: string };

/**
 * 16 R32-Matches in Bracket-Reihenfolge (M1..M16).
 *
 * Slot-Pairings sind aus dem öffentlichen FIFA-Schema verifiziert. Die
 * Bracket-Anordnung — also welche R32-Sieger im R16 zusammentreffen — folgt
 * dem Standard-Paarungs-Schema (M1+M2 → R16_1, M3+M4 → R16_2, …) und der
 * Wimbledon-Style-Logik der vier Top-Setzlinge in vier verschiedenen
 * Quadranten (1G Spanien, 1I Frankreich, 1L England, 1J Argentinien).
 */
export const R32_MATCHES: readonly [Slot, Slot][] = [
  // R16-Match 1 (Quadrant 1, oben)
  [{ type: "groupWinner", group: "E" }, { type: "bestThird", allowedGroups: ["A", "B", "C", "D", "F"], label: "3ABCDF" }],
  [{ type: "groupWinner", group: "I" }, { type: "bestThird", allowedGroups: ["C", "D", "F", "G", "H"], label: "3CDFGH" }],
  // R16-Match 2 (Quadrant 1, unten)
  [{ type: "groupRunnerUp", group: "A" }, { type: "groupRunnerUp", group: "B" }],
  [{ type: "groupWinner", group: "F" }, { type: "groupRunnerUp", group: "C" }],
  // R16-Match 3 (Quadrant 2, oben)
  [{ type: "groupRunnerUp", group: "K" }, { type: "groupRunnerUp", group: "L" }],
  [{ type: "groupWinner", group: "H" }, { type: "groupRunnerUp", group: "J" }],
  // R16-Match 4 (Quadrant 2, unten)
  [{ type: "groupWinner", group: "D" }, { type: "bestThird", allowedGroups: ["B", "E", "F", "I", "J"], label: "3BEFIJ" }],
  [{ type: "groupWinner", group: "G" }, { type: "bestThird", allowedGroups: ["A", "E", "H", "I", "J"], label: "3AEHIJ" }],
  // R16-Match 5 (Quadrant 3, oben)
  [{ type: "groupWinner", group: "C" }, { type: "groupRunnerUp", group: "F" }],
  [{ type: "groupRunnerUp", group: "E" }, { type: "groupRunnerUp", group: "I" }],
  // R16-Match 6 (Quadrant 3, unten)
  [{ type: "groupWinner", group: "A" }, { type: "bestThird", allowedGroups: ["C", "E", "F", "H", "I"], label: "3CEFHI" }],
  [{ type: "groupWinner", group: "L" }, { type: "bestThird", allowedGroups: ["E", "H", "I", "J", "K"], label: "3EHIJK" }],
  // R16-Match 7 (Quadrant 4, oben)
  [{ type: "groupWinner", group: "J" }, { type: "groupRunnerUp", group: "H" }],
  [{ type: "groupRunnerUp", group: "D" }, { type: "groupRunnerUp", group: "G" }],
  // R16-Match 8 (Quadrant 4, unten)
  [{ type: "groupWinner", group: "B" }, { type: "bestThird", allowedGroups: ["E", "F", "G", "I", "J"], label: "3EFGIJ" }],
  [{ type: "groupWinner", group: "K" }, { type: "bestThird", allowedGroups: ["D", "E", "I", "J", "L"], label: "3DEIJL" }],
];

/**
 * Bracket-Verkettung. Für jede Runde: welche zwei vorherigen Matches feeden
 * in welches neue Match. Index-basiert (0..n-1).
 */
export interface BracketRound {
  feeders: [number, number][]; // pro Match: [prev_match_a, prev_match_b]
}

export const R16_ROUND: BracketRound = {
  feeders: [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
    [8, 9],
    [10, 11],
    [12, 13],
    [14, 15],
  ],
};

export const QF_ROUND: BracketRound = {
  feeders: [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
  ],
};

export const SF_ROUND: BracketRound = {
  feeders: [
    [0, 1],
    [2, 3],
  ],
};

export const FINAL_ROUND: BracketRound = {
  feeders: [[0, 1]],
};
