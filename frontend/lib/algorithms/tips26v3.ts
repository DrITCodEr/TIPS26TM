import type { Team } from "@/lib/types/team";
import type { FactorWeights } from "@/lib/types/factors";
import type { MarktQuoten } from "@/lib/types/odds";
import type { PlayerAggregates } from "@/lib/types/player";
import { normalize } from "./normalize";
import { calculateStrengths_v2 } from "./tips26v2";

/**
 * TIPS-26.3 Player-Enhanced
 *
 * Erweitert v2 um aggregierte Player-Level-Features nach Stübinger et al.
 * (2020): Top-11-Marktwert, Top-5-Liga-Anteil, UCL-Spieler, Squad-xG und
 * GK-PSxG. Diese adressieren bekannte Schwächen von reinen Team-Aggregaten
 * (z.B. dass Gesamt-Kader-Marktwert die Bench mitzählt).
 *
 * Match-Simulation bleibt unverändert (= v2): das Player-Signal fließt nur
 * in die Pre-Tournament-Stärke ein. Eine asymmetrische λ-Verschiebung
 * pro Match (xG_attack vs xGA_defense) folgt erst mit ML in Phase 8.
 */

function avg<T>(arr: T[], key: (t: T) => number): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, x) => s + key(x), 0) / arr.length;
}

/**
 * Aggregiert die normalisierten Player-Features pro Team zu einem Composite [0..1].
 *
 * Gewichte folgen Stübinger 2020 (relative Feature-Importance via SHAP):
 *   Top-11-Markt 30 %, %-Top-5-Ligen 15 %, UCL-Spieler 15 %,
 *   xG-Attacke 20 %, xGA-Defense (invertiert) 15 %, GK-PSxG 5 %
 */
export function computePlayerComposite(
  teams: Team[],
  aggregates: Record<string, PlayerAggregates>,
): number[] {
  const top11 = teams.map((t) => aggregates[t.name]?.top11Markt ?? 0);
  const pct5 = teams.map((t) => aggregates[t.name]?.pctTop5Ligen ?? 0);
  const ucl = teams.map((t) => aggregates[t.name]?.uclSpieler ?? 0);
  const xgAvg = avg(teams, (t) => aggregates[t.name]?.xgAttacke ?? 0);
  const xgaAvg = avg(teams, (t) => aggregates[t.name]?.xgaDefense ?? 0);
  const gkAvg = avg(teams, (t) => aggregates[t.name]?.gkPsxg ?? 0);
  const xg = teams.map((t) => aggregates[t.name]?.xgAttacke ?? xgAvg);
  const xga = teams.map((t) => aggregates[t.name]?.xgaDefense ?? xgaAvg);
  const gk = teams.map((t) => aggregates[t.name]?.gkPsxg ?? gkAvg);

  const nTop11 = normalize(top11);
  const nPct5 = normalize(pct5);
  const nUcl = normalize(ucl);
  const nXg = normalize(xg);
  const nXga = normalize(xga).map((v) => 1 - v); // niedrige xGA = besser
  const nGk = normalize(gk);

  return teams.map(
    (_, i) =>
      0.3 * nTop11[i] +
      0.15 * nPct5[i] +
      0.15 * nUcl[i] +
      0.2 * nXg[i] +
      0.15 * nXga[i] +
      0.05 * nGk[i],
  );
}

/**
 * TIPS-26.3 Stärke-Berechnung. Blendet v2 (70 %) mit Player-Composite (30 %).
 *
 * v2 enthält bereits Markt-Information; Player-Composite ist additives Signal,
 * deshalb der niedrigere Gewichtungsanteil von 30 %.
 */
export function calculateStrengths_v3(
  teams: Team[],
  weights: FactorWeights,
  marktQuoten: MarktQuoten,
  playerAggregates: Record<string, PlayerAggregates>,
): number[] {
  const v2 = calculateStrengths_v2(teams, weights, marktQuoten);
  const composite = computePlayerComposite(teams, playerAggregates);
  return teams.map((_, i) => 0.7 * v2[i] + 0.3 * composite[i]);
}
