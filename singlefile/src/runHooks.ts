import { useCallback } from "react";
import { selectNumSimulations, useStore } from "@/store";
import { runMonteCarlo } from "@lib/algorithms/monteCarlo";
import { runSensitivity } from "@lib/algorithms/sensitivity";
import { TEAMS } from "@lib/data/teams";
import { SCHEDULE } from "@lib/data/schedule";
import { MARKT_QUOTEN } from "@lib/data/marktQuoten";
import { PLAYER_AGGREGATES } from "@lib/data/playerAggregates";
import { translations, DEFAULT_LOCALE, type Locale } from "@/i18n/translations";

const MIN_OVERLAY_MS = 2500;

function dict(locale: Locale | null) {
  return translations[locale ?? DEFAULT_LOCALE];
}

function simPhaseFor(p: number, locale: Locale | null): string {
  const phases = dict(locale).loading.simPhases;
  if (p < 0.05) return phases.weighting;
  if (p < 0.3) return phases.groupStage;
  if (p < 0.55) return phases.ro16;
  if (p < 0.8) return phases.semiFinal;
  return phases.aggregating;
}
function sensPhaseFor(p: number, locale: Locale | null): string {
  const phases = dict(locale).loading.sensPhases;
  if (p < 0.3) return phases.varying;
  if (p < 0.6) return phases.scenarios;
  if (p < 0.9) return phases.variance;
  return phases.quantiles;
}

function localeNum(locale: Locale | null): string {
  return (locale ?? DEFAULT_LOCALE) === "de" ? "de-DE" : "en-US";
}

export function useRunSimulation(onDone?: () => void) {
  return useCallback(async () => {
    const s = useStore.getState();
    const locale = s.locale;
    const t = dict(locale);
    const lng = localeNum(locale);
    const N = selectNumSimulations(s);
    const start = Date.now();

    s.setLoading({
      kind: "simulation",
      phase: t.loading.simPhases.stadiums,
      progress: 0,
      counterText: `0 / ${N.toLocaleString(lng)}`,
    });

    await new Promise((r) => setTimeout(r, 350));

    let lastPhaseChange = 0;
    const result = await runMonteCarlo({
      algorithm: s.algorithm,
      weights: s.weights,
      numSimulations: N,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      playerAggregates: PLAYER_AGGREGATES,
      surpriseSigma: (s.surprisePercent / 100) * 0.3,
      dispersion: (s.dispersionPercent / 100) * 1.5,
      dfbAlwaysWins: s.dfbAlwaysWins,
      onProgress: (p) => {
        const done = Math.round(p * N);
        const now = Date.now();
        const changePhase = now - lastPhaseChange > 600;
        if (changePhase) lastPhaseChange = now;
        useStore.getState().setLoading({
          progress: p,
          counterText: `${done.toLocaleString(lng)} / ${N.toLocaleString(lng)} ${t.loading.tournamentsLabel}`,
          ...(changePhase ? { phase: simPhaseFor(p, locale) } : {}),
        });
      },
    });

    const elapsed = Date.now() - start;
    if (elapsed < MIN_OVERLAY_MS) {
      useStore.getState().setLoading({
        phase: t.loading.simPhases.evaluating,
        progress: 1,
        counterText: `${N.toLocaleString(lng)} / ${N.toLocaleString(lng)} ✓`,
      });
      await new Promise((r) => setTimeout(r, MIN_OVERLAY_MS - elapsed));
    }

    useStore.getState().setSimulationResult(result);
    useStore.getState().setLoading({ phase: t.loading.simPhases.complete });
    await new Promise((r) => setTimeout(r, 400));
    useStore.getState().resetLoading();
    onDone?.();
  }, [onDone]);
}

export function useRunSensitivity() {
  return useCallback(async () => {
    const s = useStore.getState();
    const locale = s.locale;
    const t = dict(locale);
    const N_PERT = 20;
    const N_SUB = 500;
    const start = Date.now();

    s.setLoading({
      kind: "sensitivity",
      phase: t.loading.sensPhases.preparing,
      progress: 0,
      counterText: `0 / ${N_PERT}`,
    });

    await new Promise((r) => setTimeout(r, 350));

    let lastPhaseChange = 0;
    const result = await runSensitivity({
      algorithm: s.algorithm,
      baseWeights: s.weights,
      rangePercent: s.sensRangePercent,
      numPerturbations: N_PERT,
      numSubSimulations: N_SUB,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      playerAggregates: PLAYER_AGGREGATES,
      surpriseSigma: (s.surprisePercent / 100) * 0.3,
      dispersion: (s.dispersionPercent / 100) * 1.5,
      dfbAlwaysWins: s.dfbAlwaysWins,
      onProgress: (p) => {
        const done = Math.round(p * N_PERT);
        const now = Date.now();
        const changePhase = now - lastPhaseChange > 700;
        if (changePhase) lastPhaseChange = now;
        useStore.getState().setLoading({
          progress: p,
          counterText: t.loading.perturbation(done, N_PERT),
          ...(changePhase ? { phase: sensPhaseFor(p, locale) } : {}),
        });
      },
    });

    const elapsed = Date.now() - start;
    if (elapsed < MIN_OVERLAY_MS) {
      useStore.getState().setLoading({
        phase: t.loading.sensPhases.drawing,
        progress: 1,
      });
      await new Promise((r) => setTimeout(r, MIN_OVERLAY_MS - elapsed));
    }

    useStore.getState().setSensitivityResult(result);
    useStore.getState().setLoading({ phase: t.loading.sensPhases.complete });
    await new Promise((r) => setTimeout(r, 400));
    useStore.getState().resetLoading();
  }, []);
}
