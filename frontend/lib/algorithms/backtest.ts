import type {
  HistoricalMatch,
  HistoricalTeam,
  HistoricalTournament,
} from "@/lib/types/backtest";
import type { FactorWeights } from "@/lib/types/factors";
import type { Team } from "@/lib/types/team";
import { calculateStrengths_v1 } from "./tips26v1";
import { analyticMatchProbs_v1, analyticMatchProbs_v2 } from "./matchProbs";
import {
  aggregateMetrics,
  calibrationBins,
  type AggregateMetrics,
  type CalibrationBin,
  type ForecastTriple,
  type MatchOutcome,
} from "./metrics";

export type BacktestAlgorithm = "v1" | "v2-nomarket";

/**
 * Note: TIPS-26.2 Advanced braucht Pre-Turnier-Bookmaker-Quoten, die für
 * historische WMs nicht in unserem Datensatz liegen. Wir bieten daher zwei
 * Backtest-Algorithmen an:
 *   • "v1"          — Classic, additive Poisson
 *   • "v2-nomarket" — v2 ohne Markt-Blend (nur Composite + Boost + log-linear
 *                     + Dixon-Coles); für puren Modell-Vergleich zu v1
 */

function toTeamLike(h: HistoricalTeam): Team {
  return {
    name: h.name,
    flag: h.flag,
    group: "A", // wird nicht benutzt
    rang: 0,
    elo: h.elo,
    fifa: h.fifa,
    markt: h.markt,
    form: h.form,
    heim: h.heim,
    wmHF: h.wmHF,
    trainer: h.trainer,
    star: h.star,
    hoehe: h.hoehe,
  };
}

function actualOutcome(m: HistoricalMatch): MatchOutcome {
  if (m.goalsA > m.goalsB) return "1";
  if (m.goalsA < m.goalsB) return "2";
  return "X";
}

export interface PerMatchForecast {
  match: HistoricalMatch;
  forecast: ForecastTriple;
  actual: MatchOutcome;
}

export interface BacktestReport {
  year: number;
  host: string;
  algorithm: BacktestAlgorithm;
  metrics: AggregateMetrics;
  calibration: CalibrationBin[];
  perMatch: PerMatchForecast[];
}

/**
 * Bewertet alle K.o.-Spiele eines historischen Turniers gegen die
 * Vorhersagen, die TIPS-26 mit den Pre-Turnier-Stärken gemacht hätte.
 *
 * Liefert sowohl aggregierte Metriken (Brier, Log-Loss, RPS, Accuracy)
 * als auch ein Reliability-Diagramm und die einzelnen Per-Match-Forecasts.
 */
export function runBacktest(
  tournament: HistoricalTournament,
  weights: FactorWeights,
  algorithm: BacktestAlgorithm = "v1",
): BacktestReport {
  const teamLike = tournament.teams.map(toTeamLike);
  const strengths = calculateStrengths_v1(teamLike, weights);
  const idxByName = new Map(teamLike.map((t, i) => [t.name, i]));

  const perMatch: PerMatchForecast[] = tournament.matches.map((m) => {
    const idxA = idxByName.get(m.teamA);
    const idxB = idxByName.get(m.teamB);
    if (idxA === undefined || idxB === undefined) {
      throw new Error(
        `Match references team not in tournament teams list: ${m.teamA} vs ${m.teamB} (WM ${tournament.year}).`,
      );
    }
    const sA = strengths[idxA];
    const sB = strengths[idxB];
    const forecast =
      algorithm === "v2-nomarket"
        ? analyticMatchProbs_v2(sA, sB)
        : analyticMatchProbs_v1(sA, sB);
    return { match: m, forecast, actual: actualOutcome(m) };
  });

  const forecasts = perMatch.map((p) => p.forecast);
  const actuals = perMatch.map((p) => p.actual);

  return {
    year: tournament.year,
    host: tournament.host,
    algorithm,
    metrics: aggregateMetrics(forecasts, actuals),
    calibration: calibrationBins(forecasts, actuals, 10),
    perMatch,
  };
}

/**
 * Identifiziert den tatsächlichen Champion + Finalisten + HF und prüft, an
 * welcher Rang-Position diese Teams in der modellgestützten Pre-Turnier-Stärke
 * landen (Sanity-Check für das Ranking).
 */
export interface ChampionRankInfo {
  championRank: number; // 1 = stärkstes Team
  runnerUpRank: number;
  sfRanks: [number, number];
  topNContainsChampion: (n: number) => boolean;
}

export function checkChampionRanks(
  tournament: HistoricalTournament,
  weights: FactorWeights,
): ChampionRankInfo {
  const teamLike = tournament.teams.map(toTeamLike);
  const strengths = calculateStrengths_v1(teamLike, weights);
  const ranked = strengths
    .map((s, i) => ({ name: teamLike[i].name, s }))
    .sort((a, b) => b.s - a.s);
  const rankOf = (name: string) =>
    ranked.findIndex((r) => r.name === name) + 1;

  const championRank = rankOf(tournament.champion);
  const runnerUpRank = rankOf(tournament.runnerUp);
  const sfRanks: [number, number] = [
    rankOf(tournament.semiFinalists[0]),
    rankOf(tournament.semiFinalists[1]),
  ];

  return {
    championRank,
    runnerUpRank,
    sfRanks,
    topNContainsChampion: (n) => championRank <= n,
  };
}
