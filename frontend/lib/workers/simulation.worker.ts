/// <reference lib="webworker" />

import { runMonteCarlo } from "@/lib/algorithms/monteCarlo";
import { runSensitivity } from "@/lib/algorithms/sensitivity";
import { TEAMS } from "@/lib/data/teams";
import { SCHEDULE } from "@/lib/data/schedule";
import { MARKT_QUOTEN } from "@/lib/data/marktQuoten";
import { PLAYER_AGGREGATES } from "@/lib/data/playerAggregates";
import type { WorkerRequest, WorkerResponse } from "./messages";

declare const self: DedicatedWorkerGlobalScope;

function post(message: WorkerResponse) {
  self.postMessage(message);
}

self.addEventListener("message", async (e: MessageEvent<WorkerRequest>) => {
  const req = e.data;
  try {
    if (req.type === "simulate") {
      const result = await runMonteCarlo({
        algorithm: req.algorithm,
        weights: req.weights,
        numSimulations: req.numSimulations,
        teams: TEAMS,
        schedule: SCHEDULE,
        marktQuoten: MARKT_QUOTEN,
        playerAggregates: PLAYER_AGGREGATES,
        surpriseSigma: req.surpriseSigma ?? 0,
        dispersion: req.dispersion ?? 0,
        dfbAlwaysWins: req.dfbAlwaysWins ?? false,
        onProgress: (value) => post({ type: "progress", value }),
      });
      post({ type: "simulationResult", value: result });
    } else if (req.type === "sensitivity") {
      const result = await runSensitivity({
        algorithm: req.algorithm,
        baseWeights: req.baseWeights,
        rangePercent: req.rangePercent,
        numPerturbations: req.numPerturbations,
        numSubSimulations: req.numSubSimulations,
        teams: TEAMS,
        schedule: SCHEDULE,
        marktQuoten: MARKT_QUOTEN,
        playerAggregates: PLAYER_AGGREGATES,
        surpriseSigma: req.surpriseSigma ?? 0,
        dispersion: req.dispersion ?? 0,
        dfbAlwaysWins: req.dfbAlwaysWins ?? false,
        onProgress: (value) => post({ type: "progress", value }),
      });
      post({ type: "sensitivityResult", value: result });
    }
  } catch (err) {
    post({
      type: "error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
});
