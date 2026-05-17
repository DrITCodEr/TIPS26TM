"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { runMonteCarlo } from "@/lib/algorithms/monteCarlo";
import { runSensitivity } from "@/lib/algorithms/sensitivity";
import { TEAMS } from "@/lib/data/teams";
import { SCHEDULE } from "@/lib/data/schedule";
import { MARKT_QUOTEN } from "@/lib/data/marktQuoten";
import {
  selectNumSimulations,
  useSimulationStore,
} from "@/lib/stores/simulationStore";
import { formatSimCount } from "@/lib/utils/format";

const MIN_OVERLAY_MS = 2500;

function phaseFor(progress: number): string {
  if (progress < 0.05) return "📊 9 Faktoren werden gewichtet ...";
  if (progress < 0.3) return "⚽ Gruppenphase wird simuliert ...";
  if (progress < 0.55) return "🏟️ Achtel- und Viertelfinale ...";
  if (progress < 0.8) return "🔥 Halbfinale & Finale ...";
  return "📈 Wahrscheinlichkeiten aggregieren ...";
}

export function useRunSimulation() {
  const router = useRouter();

  return useCallback(async () => {
    const store = useSimulationStore.getState();
    const N = selectNumSimulations(store);
    const start = Date.now();

    store.setSimState("running");
    store.setLoading({
      kind: "simulation",
      phase: "🏟️ Stadien werden geöffnet ...",
      progress: 0,
      counterText: `0 / ${N}`,
    });

    // Kurze Aufwärmphase für UX
    await new Promise((r) => setTimeout(r, 350));

    let lastPhaseChange = 0;
    const result = await runMonteCarlo({
      algorithm: store.algorithm,
      weights: store.weights,
      numSimulations: N,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      onProgress: (p) => {
        const done = Math.round(p * N);
        const phase = phaseFor(p);
        const now = Date.now();
        const changePhase = now - lastPhaseChange > 600;
        if (changePhase) lastPhaseChange = now;
        useSimulationStore.getState().setLoading({
          progress: p,
          counterText: `${done.toLocaleString("de-DE")} / ${N.toLocaleString("de-DE")} Turniere`,
          ...(changePhase ? { phase } : {}),
        });
      },
    });

    // Min-Anzeigedauer
    const elapsed = Date.now() - start;
    if (elapsed < MIN_OVERLAY_MS) {
      useSimulationStore.getState().setLoading({
        phase: "✨ Ergebnisse werden ausgewertet ...",
        progress: 1,
        counterText: `${N.toLocaleString("de-DE")} / ${N.toLocaleString("de-DE")} ✓`,
      });
      await new Promise((r) => setTimeout(r, MIN_OVERLAY_MS - elapsed));
    }

    useSimulationStore.getState().setSimulationResult(result);
    useSimulationStore.getState().setSimState("complete");
    useSimulationStore.getState().setLoading({
      phase: "✅ Simulation abgeschlossen!",
    });
    await new Promise((r) => setTimeout(r, 400));
    useSimulationStore.getState().resetLoading();

    // Navigiere zur Gruppen-Übersicht — dort sieht man das Ergebnis sofort
    router.push("/groups");
  }, [router]);
}

function sensPhaseFor(progress: number): string {
  if (progress < 0.3) return "🎲 Faktoren werden zufällig variiert ...";
  if (progress < 0.6) return "⚽ Alternative Szenarien werden gespielt ...";
  if (progress < 0.9) return "📊 Streuung wird gemessen ...";
  return "📈 Quantile werden berechnet ...";
}

export function useRunSensitivity() {
  return useCallback(async () => {
    const store = useSimulationStore.getState();
    const { sensRangePercent, algorithm, weights } = store;
    const N_PERT = 20;
    const N_SUB = 500;
    const start = Date.now();

    store.setLoading({
      kind: "sensitivity",
      phase: "🎲 Zufalls-Variationen werden vorbereitet ...",
      progress: 0,
      counterText: `0 / ${N_PERT}`,
    });

    await new Promise((r) => setTimeout(r, 350));

    let lastPhaseChange = 0;
    const result = await runSensitivity({
      algorithm,
      baseWeights: weights,
      rangePercent: sensRangePercent,
      numPerturbations: N_PERT,
      numSubSimulations: N_SUB,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      onProgress: (p) => {
        const done = Math.round(p * N_PERT);
        const phase = sensPhaseFor(p);
        const now = Date.now();
        const changePhase = now - lastPhaseChange > 700;
        if (changePhase) lastPhaseChange = now;
        useSimulationStore.getState().setLoading({
          progress: p,
          counterText: `Perturbation ${done} / ${N_PERT}`,
          ...(changePhase ? { phase } : {}),
        });
      },
    });

    const elapsed = Date.now() - start;
    if (elapsed < MIN_OVERLAY_MS) {
      useSimulationStore.getState().setLoading({
        phase: "✨ Box-Plots werden gezeichnet ...",
        progress: 1,
      });
      await new Promise((r) => setTimeout(r, MIN_OVERLAY_MS - elapsed));
    }

    useSimulationStore.getState().setSensitivityResult(result);
    useSimulationStore.getState().setLoading({
      phase: "✅ Analyse abgeschlossen!",
    });
    await new Promise((r) => setTimeout(r, 400));
    useSimulationStore.getState().resetLoading();
  }, []);
}

export { formatSimCount };
