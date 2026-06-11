"use client";

import { Button } from "@/components/ui/Button";
import {
  selectNumSimulations,
  useSimulationStore,
} from "@/lib/stores/simulationStore";
import { useRunSimulation } from "@/lib/hooks/useRunSimulation";
import { formatSimCount } from "@/lib/utils/format";

export function RunSimulationButton() {
  const idx = useSimulationStore((s) => s.numSimulationsIdx);
  const simState = useSimulationStore((s) => s.simState);
  const loading = useSimulationStore((s) => s.loading.kind);
  const run = useRunSimulation();
  const N = selectNumSimulations({ numSimulationsIdx: idx });
  const display = formatSimCount(N);
  const isBusy = loading !== null;

  return (
    <div className="mt-4">
      <Button
        variant="primary"
        fullWidth
        disabled={isBusy}
        onClick={run}
      >
        {isBusy
          ? "⏳ Simuliere ..."
          : simState === "complete"
            ? `🔁 Erneut simulieren · ${display}×`
            : `🎲 Simulation starten · ${display}×`}
      </Button>
      <div
        className="text-center text-[11px] mt-2 font-semibold"
        style={{ color: "var(--text-tertiary)" }}
      >
        {simState === "complete"
          ? "✓ Letzte Simulation abgeschlossen"
          : "Bereit zum Simulieren"}
      </div>
    </div>
  );
}
