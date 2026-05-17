import type { Team } from "@/lib/types/team";
import type { FactorWeights } from "@/lib/types/factors";
import type { MarktQuoten } from "@/lib/types/odds";
import { FAKTOREN } from "@/lib/data/factors";
import { MARKT_MARGIN } from "@/lib/data/marktQuoten";
import { normalizeFactor } from "./normalize";
import { poissonRandom } from "./poisson";
import { defaultRng, type Rng } from "./random";
import type { MatchResult } from "./tips26v1";

/**
 * Composite-Score (Multikollinearitäts-Korrektur):
 *
 * ELO, FIFA-Punkte und Marktwert korrelieren empirisch hoch (r > 0.85).
 * Statt drei separate Features kollabieren wir sie zu einer linearen
 * Kombination — analog zur ersten Hauptkomponente einer PCA.
 *
 * Gewichte folgen typischer Variance-Explanation in Lasso-Regressionen
 * (Groll et al. 2015): ELO 50 %, FIFA 20 %, Marktwert 30 %.
 */
export function compositeScore(
  normalizedELO: number,
  normalizedFIFA: number,
  normalizedMarkt: number,
): number {
  return 0.5 * normalizedELO + 0.2 * normalizedFIFA + 0.3 * normalizedMarkt;
}

/** Markt-implizite Wahrscheinlichkeit (vig-bereinigt) für Turniersieg. */
export function marktProbTitel(
  teamName: string,
  marktQuoten: MarktQuoten,
  margin: number = MARKT_MARGIN,
): number {
  const odds = marktQuoten[teamName] ?? 9999;
  return 1 / odds / margin;
}

/**
 * TIPS-26.2 Advanced: Composite-Score + nicht-linearer Boost
 *                     + Markt-Konsens-Blend (70 % TIPS + 30 % Markt).
 */
export function calculateStrengths_v2(
  teams: Team[],
  weights: FactorWeights,
  marktQuoten: MarktQuoten,
  margin: number = MARKT_MARGIN,
): number[] {
  const normalized = {} as Record<string, number[]>;
  for (const f of FAKTOREN) {
    normalized[f.key] = normalizeFactor(teams, f.key);
  }

  // Composite ersetzt die drei korrelierten Faktoren
  const composite = teams.map((_, i) =>
    compositeScore(
      normalized.elo[i],
      normalized.fifa[i],
      normalized.markt[i],
    ),
  );

  const wComposite = weights.elo + weights.fifa + weights.markt;
  const totalW =
    wComposite +
    weights.form +
    weights.heim +
    weights.wmHF +
    weights.trainer +
    weights.star +
    weights.hoehe;
  const sumW = totalW || 1;

  // TIPS-Score mit nicht-linearer Interaktion: Top-Teams mit hoher Form
  // bekommen einen multiplikativen Bonus (Momentum-Effekt).
  const tipsScores = teams.map((_, i) => {
    let s =
      (composite[i] * wComposite +
        normalized.form[i] * weights.form +
        normalized.heim[i] * weights.heim +
        normalized.wmHF[i] * weights.wmHF +
        normalized.trainer[i] * weights.trainer +
        normalized.star[i] * weights.star +
        normalized.hoehe[i] * weights.hoehe) /
      sumW;

    if (composite[i] > 0.7 && normalized.form[i] > 0.7) {
      s += 0.05 * composite[i] * normalized.form[i];
    }
    return s;
  });

  // Markt-Stärken: Sqrt-Mapping verbessert Auflösung im unteren Bereich
  const marktProbs = teams.map((t) => marktProbTitel(t.name, marktQuoten, margin));
  const maxMarktProb = Math.max(...marktProbs);
  const marktStaerken = marktProbs.map((p) => Math.sqrt(p / maxMarktProb));

  // Ensemble-Blend: 70 % TIPS + 30 % Markt (Stacking nach Stübinger 2020)
  return teams.map((_, i) => 0.7 * tipsScores[i] + 0.3 * marktStaerken[i]);
}

/**
 * Log-lineare Tor-Formel nach Maher (1982) / Dixon-Coles (1997):
 *
 *   log(λ) = c + (S_A − S_B) * scale
 *
 * `c = ln(1.4) ≈ 0.336` → bei diff = 0 entspricht das λ = 1.4 wie in v1.
 * `scale = 0.9` ist kalibriert für ähnliche Reaktion bei Standard-Diffs.
 *
 * Garantie: λ > 0 immer (kein hartes Floor wie in v1). Smooth decay bei
 * großen Stärkedifferenzen.
 *
 * Dixon-Coles τ-Korrektur als Resampling-Approximation: ρ ≈ −0.13 verschiebt
 * Wahrscheinlichkeit von (0,0), (1,0), (0,1) hin zu (1,1) — empirisch sind
 * Unentschieden häufiger als reines Poisson vorhersagt.
 */
export function simulateMatch_v2(
  sA: number,
  sB: number,
  rng: Rng = defaultRng,
): MatchResult {
  const diff = sA - sB;
  const lambdaA = Math.exp(0.336 + diff * 0.9);
  const lambdaB = Math.exp(0.336 - diff * 0.9);

  let toreA = poissonRandom(lambdaA, rng);
  let toreB = poissonRandom(lambdaB, rng);

  if (toreA === 0 && toreB === 0) {
    if (rng() < 0.1) {
      toreA = 1;
      toreB = 1;
    }
  } else if (toreA === 1 && toreB === 0) {
    if (rng() < 0.06) {
      toreA = 1;
      toreB = 1;
    }
  } else if (toreA === 0 && toreB === 1) {
    if (rng() < 0.06) {
      toreA = 1;
      toreB = 1;
    }
  }

  return { toreA, toreB };
}
