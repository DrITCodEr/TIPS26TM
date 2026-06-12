import type { Match } from "@/lib/types/match";
import type { LiveMatchResult } from "@/lib/data/liveResults";

/**
 * Aktualisiert die Pre-Turnier-Stärken mit Live-Ergebnissen.
 *
 * Verfahren (ELO-ähnlich, kalibriert auf normalisierte Stärken ∈ [0, 1]):
 *
 *   expected_A = σ(SCALE · (S_A − S_B))         // erwartete Win-Prob für A
 *   actual_A   = 1 (Sieg) | 0.5 (Remis) | 0 (Niederlage)
 *   margin_w   = log2(|toreA − toreB| + 1)      // 1:0 → 1.0, 5:0 → 2.585
 *   Δ          = K_BASE · α · margin_w · (actual − expected)
 *   S_A_neu    = clamp(S_A + Δ, 0.05, 0.95)
 *   S_B_neu    = clamp(S_B − Δ, 0.05, 0.95)
 *
 * α = `alpha` ∈ [0, 1] aus dem UI-Slider (0 = kein Update, 1 = maximal).
 * K_BASE = 0.05 — entspricht in etwa ELO K=20 für 0..1-skalierte Stärken;
 * gewählt so, dass ein typisches Gruppenspiel (Margin 1, klare Erwartung)
 * bei α=1 die Stärke um ≈0.025 schiebt, bei α=0.2 (Default-UI) um ≈0.005.
 *
 * Skala SCALE=8 ist so kalibriert, dass eine Stärke-Differenz 0.1 ≈ 69 %
 * Siegwahrscheinlichkeit ergibt (typisches Top-vs-Mittel-Match).
 */
export function updateStrengthsFromLive(
  baseStaerken: number[],
  liveResults: Record<number, LiveMatchResult>,
  schedule: Match[],
  alpha: number,
): number[] {
  if (alpha <= 0) return baseStaerken;
  const SCALE = 8;
  const K_BASE = 0.05;
  const LOG2 = Math.log(2);

  const staerken = baseStaerken.slice();
  for (const k of Object.keys(liveResults)) {
    const mi = Number(k);
    const r = liveResults[mi];
    if (!r.isFinished) continue;
    if (mi < 0 || mi >= schedule.length) continue;
    const m = schedule[mi];
    if (m.idxA == null || m.idxB == null) continue;
    const a = m.idxA;
    const b = m.idxB;
    const sa = staerken[a];
    const sb = staerken[b];

    const expectedA = 1 / (1 + Math.exp(-SCALE * (sa - sb)));
    const actualA = r.goalsA > r.goalsB ? 1 : r.goalsA < r.goalsB ? 0 : 0.5;
    const margin = Math.abs(r.goalsA - r.goalsB);
    const marginW = Math.log(margin + 1) / LOG2;
    const delta = K_BASE * alpha * marginW * (actualA - expectedA);

    staerken[a] = Math.max(0.05, Math.min(0.95, sa + delta));
    staerken[b] = Math.max(0.05, Math.min(0.95, sb - delta));
  }
  return staerken;
}

/** Anzahl bereits abgepfiffener Gruppenspiele in den Live-Daten. */
export function countFinishedMatches(
  liveResults: Record<number, LiveMatchResult>,
  scheduleLength: number,
): number {
  let n = 0;
  for (const k of Object.keys(liveResults)) {
    const mi = Number(k);
    if (mi < 0 || mi >= scheduleLength) continue;
    if (liveResults[mi].isFinished) n++;
  }
  return n;
}
