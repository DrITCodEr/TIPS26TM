import type { Team } from "@/lib/types/team";
import type { FactorKey } from "@/lib/types/factors";

/**
 * Min-Max-Normalisierung auf [0, 1]. Range = 0 (alle Werte identisch) → 0.5.
 */
export function normalize(values: number[]): number[] {
  if (values.length === 0) return [];
  let min = values[0];
  let max = values[0];
  for (let i = 1; i < values.length; i++) {
    if (values[i] < min) min = values[i];
    if (values[i] > max) max = values[i];
  }
  const range = max - min;
  if (range === 0) return values.map(() => 0.5);
  return values.map((v) => (v - min) / range);
}

export function normalizeFactor(teams: Team[], key: FactorKey): number[] {
  return normalize(teams.map((t) => t[key]));
}
