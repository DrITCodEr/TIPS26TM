"use client";

import { Button } from "@/components/ui/Button";
import {
  PRESET_LABELS,
  PRESETS,
  type PresetKey,
} from "@/lib/data/presets";
import { useSimulationStore } from "@/lib/stores/simulationStore";

const PRESET_ORDER: PresetKey[] = [
  "default",
  "balanced",
  "elo",
  "market",
  "form",
  "experience",
];

export function Presets() {
  const activePreset = useSimulationStore((s) => s.activePreset);
  const applyPreset = useSimulationStore((s) => s.applyPreset);

  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_ORDER.map((key) => (
        <Button
          key={key}
          active={activePreset === key}
          onClick={() => applyPreset(key)}
        >
          {PRESET_LABELS[key]}
        </Button>
      ))}
      <div
        className="basis-full text-[10px] mt-1 ml-1"
        style={{ color: "var(--text-tertiary)" }}
      >
        Aktuell: {activePreset ? PRESET_LABELS[activePreset] : "Eigene Gewichtung"}
        {activePreset && (
          <>
            {" · Σ "}
            {Object.values(PRESETS[activePreset]).reduce((a, b) => a + b, 0)}
          </>
        )}
      </div>
    </div>
  );
}
