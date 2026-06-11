"use client";

import { Slider } from "@/components/ui/Slider";
import { FAKTOREN } from "@/lib/data/factors";
import { useSimulationStore } from "@/lib/stores/simulationStore";

export function FactorSliders() {
  const weights = useSimulationStore((s) => s.weights);
  const setWeight = useSimulationStore((s) => s.setWeight);

  return (
    <div className="space-y-2.5">
      {FAKTOREN.map((f) => (
        <Slider
          key={f.key}
          label={f.label}
          icon={f.icon}
          min={0}
          max={f.max}
          value={weights[f.key]}
          valueLabel={`${weights[f.key]}%`}
          onChange={(v) => setWeight(f.key, v)}
        />
      ))}
    </div>
  );
}
