"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  selectNumSimulations,
  useSimulationStore,
} from "@/lib/stores/simulationStore";
import { formatSimCount } from "@/lib/utils/format";
import type {
  SimulateRequest,
  SensitivityRequest,
  WorkerResponse,
} from "@/lib/workers/messages";

const MIN_OVERLAY_MS = 2500;

function createWorker(): Worker {
  return new Worker(
    new URL("@/lib/workers/simulation.worker.ts", import.meta.url),
    { type: "module" },
  );
}

function simPhaseFor(progress: number): string {
  if (progress < 0.05) return "📊 9 Faktoren werden gewichtet ...";
  if (progress < 0.3) return "⚽ Gruppenphase wird simuliert ...";
  if (progress < 0.55) return "🏟️ Achtel- und Viertelfinale ...";
  if (progress < 0.8) return "🔥 Halbfinale & Finale ...";
  return "📈 Wahrscheinlichkeiten aggregieren ...";
}

function sensPhaseFor(progress: number): string {
  if (progress < 0.3) return "🎲 Faktoren werden zufällig variiert ...";
  if (progress < 0.6) return "⚽ Alternative Szenarien werden gespielt ...";
  if (progress < 0.9) return "📊 Streuung wird gemessen ...";
  return "📈 Quantile werden berechnet ...";
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
      counterText: `0 / ${N.toLocaleString("de-DE")}`,
    });

    await new Promise((r) => setTimeout(r, 350));

    const worker = createWorker();
    let lastPhaseChange = 0;

    const result = await new Promise<
      Awaited<ReturnType<typeof import("@/lib/algorithms/monteCarlo").runMonteCarlo>>
    >((resolve, reject) => {
      worker.addEventListener("message", (e: MessageEvent<WorkerResponse>) => {
        const msg = e.data;
        if (msg.type === "progress") {
          const p = msg.value;
          const done = Math.round(p * N);
          const now = Date.now();
          const changePhase = now - lastPhaseChange > 600;
          if (changePhase) lastPhaseChange = now;
          useSimulationStore.getState().setLoading({
            progress: p,
            counterText: `${done.toLocaleString("de-DE")} / ${N.toLocaleString("de-DE")} Turniere`,
            ...(changePhase ? { phase: simPhaseFor(p) } : {}),
          });
        } else if (msg.type === "simulationResult") {
          resolve(msg.value);
        } else if (msg.type === "error") {
          reject(new Error(msg.message));
        }
      });
      worker.addEventListener("error", (e) => reject(new Error(e.message)));

      const req: SimulateRequest = {
        type: "simulate",
        algorithm: store.algorithm,
        weights: store.weights,
        numSimulations: N,
        surpriseSigma: (store.surprisePercent / 100) * 0.3,
        dispersion: (store.dispersionPercent / 100) * 0.4,
        dfbAlwaysWins: store.dfbAlwaysWins,
      };
      worker.postMessage(req);
    }).finally(() => worker.terminate());

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

    router.push("/groups");
  }, [router]);
}

export function useRunSensitivity() {
  return useCallback(async () => {
    const store = useSimulationStore.getState();
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

    const worker = createWorker();
    let lastPhaseChange = 0;

    const result = await new Promise<
      Awaited<ReturnType<typeof import("@/lib/algorithms/sensitivity").runSensitivity>>
    >((resolve, reject) => {
      worker.addEventListener("message", (e: MessageEvent<WorkerResponse>) => {
        const msg = e.data;
        if (msg.type === "progress") {
          const p = msg.value;
          const done = Math.round(p * N_PERT);
          const now = Date.now();
          const changePhase = now - lastPhaseChange > 700;
          if (changePhase) lastPhaseChange = now;
          useSimulationStore.getState().setLoading({
            progress: p,
            counterText: `Perturbation ${done} / ${N_PERT}`,
            ...(changePhase ? { phase: sensPhaseFor(p) } : {}),
          });
        } else if (msg.type === "sensitivityResult") {
          resolve(msg.value);
        } else if (msg.type === "error") {
          reject(new Error(msg.message));
        }
      });
      worker.addEventListener("error", (e) => reject(new Error(e.message)));

      const req: SensitivityRequest = {
        type: "sensitivity",
        algorithm: store.algorithm,
        baseWeights: store.weights,
        rangePercent: store.sensRangePercent,
        numPerturbations: N_PERT,
        numSubSimulations: N_SUB,
        surpriseSigma: (store.surprisePercent / 100) * 0.3,
        dispersion: (store.dispersionPercent / 100) * 0.4,
        dfbAlwaysWins: store.dfbAlwaysWins,
      };
      worker.postMessage(req);
    }).finally(() => worker.terminate());

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
