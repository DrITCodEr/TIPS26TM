import type { AlgorithmVersion } from "@/lib/types/simulation";
import { simulateMatch } from "./index";
import { defaultRng, type Rng } from "./random";

/**
 * K.o.-Spiel: bei Remis ein stärken-gewichteter Coin-Flip.
 *
 * Modelliert Verlängerung + Elfmeterschießen — die stärkere Mannschaft hat
 * einen leichten Vorteil, aber auch die schwächere gewinnt mit ≥15 %.
 *
 * `surpriseSigma` wird an `simulateMatch` durchgereicht; der Coin-Flip-Step
 * bei Remis nutzt weiterhin die unperturbierten Original-Stärken (das
 * Elfmeterschießen modelliert Charakter/Erfahrung, nicht Tagesform).
 */
export function simulateKnockout(
  algorithm: AlgorithmVersion,
  idxA: number,
  idxB: number,
  staerken: number[],
  rng: Rng = defaultRng,
  surpriseSigma = 0,
): number {
  const result = simulateMatch(
    algorithm,
    staerken[idxA],
    staerken[idxB],
    rng,
    surpriseSigma,
  );
  if (result.toreA > result.toreB) return idxA;
  if (result.toreB > result.toreA) return idxB;
  const diff = staerken[idxA] - staerken[idxB];
  const probA = Math.min(0.85, Math.max(0.15, 0.5 + diff * 1.5));
  return rng() < probA ? idxA : idxB;
}
