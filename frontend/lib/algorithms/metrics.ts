export type MatchOutcome = "1" | "X" | "2";

export interface ForecastTriple {
  winA: number;
  draw: number;
  winB: number;
}

function normalize(f: ForecastTriple): ForecastTriple {
  const total = f.winA + f.draw + f.winB;
  if (total <= 0) return { winA: 1 / 3, draw: 1 / 3, winB: 1 / 3 };
  return { winA: f.winA / total, draw: f.draw / total, winB: f.winB / total };
}

function outcomeProb(f: ForecastTriple, o: MatchOutcome): number {
  if (o === "1") return f.winA;
  if (o === "2") return f.winB;
  return f.draw;
}

/**
 * Brier-Score für 3-Outcome-Vorhersage.
 *
 *   BS = Σ_k (p_k − o_k)²   mit o_k ∈ {0, 1}
 *
 * Wertebereich [0, 2]. Niedriger = besser. Random-Guess ≈ 0.667.
 */
export function brierScore(
  forecast: ForecastTriple,
  actual: MatchOutcome,
): number {
  const f = normalize(forecast);
  const o = {
    "1": [1, 0, 0],
    X: [0, 1, 0],
    "2": [0, 0, 1],
  }[actual];
  return (f.winA - o[0]) ** 2 + (f.draw - o[1]) ** 2 + (f.winB - o[2]) ** 2;
}

/**
 * Log-Loss (Cross-Entropy) für die tatsächliche Outcome-Wahrscheinlichkeit.
 *
 *   LL = −ln(p_actual)
 *
 * Floor bei 1e-15 verhindert ln(0). Niedriger = besser.
 */
export function logLoss(
  forecast: ForecastTriple,
  actual: MatchOutcome,
): number {
  const f = normalize(forecast);
  const p = Math.max(1e-15, outcomeProb(f, actual));
  return -Math.log(p);
}

/**
 * Ranked Probability Score — berücksichtigt ordinale Distanz.
 * Für 3-Outcome (1 < X < 2) der Standard für Fußball-Forecasting.
 *
 *   RPS = Σ_k (Σ_{j≤k} p_j − Σ_{j≤k} o_j)²  /  (K − 1)
 */
export function rankedProbabilityScore(
  forecast: ForecastTriple,
  actual: MatchOutcome,
): number {
  const f = normalize(forecast);
  const o = {
    "1": [1, 0, 0],
    X: [0, 1, 0],
    "2": [0, 0, 1],
  }[actual];
  const cf = [f.winA, f.winA + f.draw, f.winA + f.draw + f.winB];
  const co = [o[0], o[0] + o[1], o[0] + o[1] + o[2]];
  return ((cf[0] - co[0]) ** 2 + (cf[1] - co[1]) ** 2) / 2;
}

/**
 * Aggregierte Metriken über N Vorhersage/Outcome-Paare.
 */
export interface AggregateMetrics {
  count: number;
  brier: number; // Mittelwert
  logLoss: number;
  rps: number;
  accuracy: number; // Anteil korrekt (argmax = actual)
}

export function aggregateMetrics(
  forecasts: ForecastTriple[],
  actuals: MatchOutcome[],
): AggregateMetrics {
  if (forecasts.length !== actuals.length) {
    throw new Error(
      `Length mismatch: ${forecasts.length} forecasts vs ${actuals.length} actuals`,
    );
  }
  const N = forecasts.length;
  if (N === 0) {
    return { count: 0, brier: 0, logLoss: 0, rps: 0, accuracy: 0 };
  }
  let brier = 0;
  let ll = 0;
  let rps = 0;
  let correct = 0;
  for (let i = 0; i < N; i++) {
    const f = forecasts[i];
    const a = actuals[i];
    brier += brierScore(f, a);
    ll += logLoss(f, a);
    rps += rankedProbabilityScore(f, a);
    // argmax
    const fn = normalize(f);
    const top =
      fn.winA >= fn.draw && fn.winA >= fn.winB
        ? "1"
        : fn.winB > fn.draw
          ? "2"
          : "X";
    if (top === a) correct++;
  }
  return {
    count: N,
    brier: brier / N,
    logLoss: ll / N,
    rps: rps / N,
    accuracy: correct / N,
  };
}

/**
 * Reliability-Diagramm: Forecast-Bin → beobachtete Häufigkeit.
 *
 * Pro Bin werden alle Forecast-Punkte (winA, draw, winB) gesammelt, deren
 * Vorhersage-Wahrscheinlichkeit in das Bin fällt. `observed` = Anteil
 * tatsächlich eingetretener Events.
 */
export interface CalibrationBin {
  binCenter: number;
  predicted: number; // mittlere Forecast-Wahrscheinlichkeit
  observed: number; // tatsächliche Eintrittsrate
  count: number;
}

export function calibrationBins(
  forecasts: ForecastTriple[],
  actuals: MatchOutcome[],
  numBins = 10,
): CalibrationBin[] {
  const bins: { sumP: number; hits: number; count: number }[] = Array.from(
    { length: numBins },
    () => ({ sumP: 0, hits: 0, count: 0 }),
  );

  for (let i = 0; i < forecasts.length; i++) {
    const f = normalize(forecasts[i]);
    const a = actuals[i];
    const probs: [number, MatchOutcome][] = [
      [f.winA, "1"],
      [f.draw, "X"],
      [f.winB, "2"],
    ];
    for (const [p, label] of probs) {
      const idx = Math.min(numBins - 1, Math.floor(p * numBins));
      bins[idx].sumP += p;
      bins[idx].count += 1;
      if (label === a) bins[idx].hits += 1;
    }
  }

  return bins.map((b, i) => ({
    binCenter: (i + 0.5) / numBins,
    predicted: b.count > 0 ? b.sumP / b.count : 0,
    observed: b.count > 0 ? b.hits / b.count : 0,
    count: b.count,
  }));
}
