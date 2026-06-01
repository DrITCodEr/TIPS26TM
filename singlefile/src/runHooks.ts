import { useCallback } from "react";
import { selectNumSimulations, useStore } from "@/store";
import { runMonteCarlo } from "@lib/algorithms/monteCarlo";
import { runSensitivity } from "@lib/algorithms/sensitivity";
import { TEAMS } from "@lib/data/teams";
import { SCHEDULE } from "@lib/data/schedule";
import { MARKT_QUOTEN } from "@lib/data/marktQuoten";
import { PLAYER_AGGREGATES } from "@lib/data/playerAggregates";

const MIN_OVERLAY_MS = 2500;

function simPhaseFor(p: number): string {
  if (p < 0.05) return "📊 9 Faktoren werden gewichtet ...";
  if (p < 0.3) return "⚽ Gruppenphase wird simuliert ...";
  if (p < 0.55) return "🏟️ Achtel- und Viertelfinale ...";
  if (p < 0.8) return "🔥 Halbfinale & Finale ...";
  return "📈 Wahrscheinlichkeiten aggregieren ...";
}
function sensPhaseFor(p: number): string {
  if (p < 0.3) return "🎲 Faktoren werden zufällig variiert ...";
  if (p < 0.6) return "⚽ Alternative Szenarien werden gespielt ...";
  if (p < 0.9) return "📊 Streuung wird gemessen ...";
  return "📈 Quantile werden berechnet ...";
}

/**
 * Single-File-Build: Sim läuft synchron im Main-Thread (kein Web Worker).
 *
 * Warum kein Worker? Bei `file://`-Origin haben Browser strikte Restriktionen
 * für Module-Workers mit Data-URL. Synchron mit `await Promise.resolve()`-
 * Yields hält die UI bei 5K–100K Sims responsiv genug. Für 1 Mio Sims wäre
 * ein echter Worker besser — diesen Use-Case bedient die Next.js-Variante
 * (frontend/) mit echtem Web Worker.
 */
export function useRunSimulation(onDone?: () => void) {
  return useCallback(async () => {
    const s = useStore.getState();
    const N = selectNumSimulations(s);
    const start = Date.now();

    s.setLoading({
      kind: "simulation",
      phase: "🏟️ Stadien werden geöffnet ...",
      progress: 0,
      counterText: `0 / ${N.toLocaleString("de-DE")}`,
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
          counterText: `${done.toLocaleString("de-DE")} / ${N.toLocaleString("de-DE")} Turniere`,
          ...(changePhase ? { phase: simPhaseFor(p) } : {}),
        });
      },
    });

    const elapsed = Date.now() - start;
    if (elapsed < MIN_OVERLAY_MS) {
      useStore.getState().setLoading({
        phase: "✨ Ergebnisse werden ausgewertet ...",
        progress: 1,
        counterText: `${N.toLocaleString("de-DE")} / ${N.toLocaleString("de-DE")} ✓`,
      });
      await new Promise((r) => setTimeout(r, MIN_OVERLAY_MS - elapsed));
    }

    useStore.getState().setSimulationResult(result);
    useStore.getState().setLoading({ phase: "✅ Simulation abgeschlossen!" });
    await new Promise((r) => setTimeout(r, 400));
    useStore.getState().resetLoading();
    onDone?.();
  }, [onDone]);
}

export function useRunSensitivity() {
  return useCallback(async () => {
    const s = useStore.getState();
    const N_PERT = 20;
    const N_SUB = 500;
    const start = Date.now();

    s.setLoading({
      kind: "sensitivity",
      phase: "🎲 Zufalls-Variationen werden vorbereitet ...",
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
          counterText: `Perturbation ${done} / ${N_PERT}`,
          ...(changePhase ? { phase: sensPhaseFor(p) } : {}),
        });
      },
    });

    const elapsed = Date.now() - start;
    if (elapsed < MIN_OVERLAY_MS) {
      useStore.getState().setLoading({
        phase: "✨ Box-Plots werden gezeichnet ...",
        progress: 1,
      });
      await new Promise((r) => setTimeout(r, MIN_OVERLAY_MS - elapsed));
    }

    useStore.getState().setSensitivityResult(result);
    useStore.getState().setLoading({ phase: "✅ Analyse abgeschlossen!" });
    await new Promise((r) => setTimeout(r, 400));
    useStore.getState().resetLoading();
  }, []);
}
