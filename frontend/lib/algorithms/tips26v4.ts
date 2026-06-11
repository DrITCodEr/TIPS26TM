import type { Team } from "@/lib/types/team";
import type { FactorWeights } from "@/lib/types/factors";
import type { MarktQuoten } from "@/lib/types/odds";
import type { PlayerAggregates } from "@/lib/types/player";
import { calculateStrengths_v1 } from "./tips26v1";
import { calculateStrengths_v2 } from "./tips26v2";
import { calculateStrengths_v3 } from "./tips26v3";

/**
 * TIPS-26.4 Ensemble Stacker
 *
 * Konvex-Kombination der drei Vorgänger-Modelle (Spec §9.13):
 *   final = w1·v1 + w2·v2 + w3·v3
 *
 * Default-Gewichte folgen typischer Out-of-Sample-Stacking-Validierung
 * (Stübinger et al. 2020, Stacking-Tabelle 4):
 *   v1: 0.15 — als Sanity-Anker (linear baseline)
 *   v2: 0.45 — Markt-Information ist der stärkste einzelne Prediktor
 *   v3: 0.40 — Player-Aggregates schließen die Lücke zu reinen Team-Stats
 *
 * Diese Default-Mischung wird in Phase 8 später durch CV-optimierte Gewichte
 * ersetzt, sobald ein .onnx-Modell vom Notebook (scripts/train_aggregator.py)
 * geladen werden kann.
 */
export interface EnsembleWeights {
  v1: number;
  v2: number;
  v3: number;
}

export const DEFAULT_ENSEMBLE_WEIGHTS: EnsembleWeights = {
  v1: 0.15,
  v2: 0.45,
  v3: 0.4,
};

export function calculateStrengths_v4(
  teams: Team[],
  weights: FactorWeights,
  marktQuoten: MarktQuoten,
  playerAggregates: Record<string, PlayerAggregates>,
  ensembleWeights: EnsembleWeights = DEFAULT_ENSEMBLE_WEIGHTS,
): number[] {
  const v1 = calculateStrengths_v1(teams, weights);
  const v2 = calculateStrengths_v2(teams, weights, marktQuoten);
  const v3 = calculateStrengths_v3(
    teams,
    weights,
    marktQuoten,
    playerAggregates,
  );
  const total =
    ensembleWeights.v1 + ensembleWeights.v2 + ensembleWeights.v3 || 1;
  const w1 = ensembleWeights.v1 / total;
  const w2 = ensembleWeights.v2 / total;
  const w3 = ensembleWeights.v3 / total;
  return teams.map((_, i) => w1 * v1[i] + w2 * v2[i] + w3 * v3[i]);
}
