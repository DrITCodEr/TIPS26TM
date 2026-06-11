"use client";

import { create } from "zustand";
import type { AlgorithmVersion, SimulationResult } from "@/lib/types/simulation";
import type { FactorWeights } from "@/lib/types/factors";
import { PRESETS, type PresetKey } from "@/lib/data/presets";
import type { SensitivityResult } from "@/lib/algorithms/sensitivity";

export const SIM_LEVELS = [
  1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000,
] as const;

export type SimState = "idle" | "running" | "complete";
export type LoadingKind = "simulation" | "sensitivity" | null;

export interface LoadingState {
  kind: LoadingKind;
  phase: string;
  progress: number; // 0..1
  counterText: string;
}

interface SimulationStore {
  // Konfiguration
  algorithm: AlgorithmVersion;
  weights: FactorWeights;
  activePreset: PresetKey | null;
  numSimulationsIdx: number; // Index in SIM_LEVELS
  sensRangePercent: 15 | 30 | 50;
  /** 0..100 ; 0 = deterministisch, 100 = ±30 % Tagesform-Streuung pro Match */
  surprisePercent: number;
  /** 0..100 ; 0 = reine Poisson-Tore, 100 = stark überdispers (häufiger 4:1, 5:0, 7:1) */
  dispersionPercent: number;
  /** 🇩🇪 Easter-Egg: DFB-Spiele werden immer 3:0 für Deutschland. */
  dfbAlwaysWins: boolean;

  // Ergebnisse
  simulationResult: SimulationResult | null;
  sensitivityResult: SensitivityResult | null;
  simState: SimState;

  // Loading
  loading: LoadingState;

  // Actions
  setAlgorithm: (algo: AlgorithmVersion) => void;
  setWeight: (key: keyof FactorWeights, value: number) => void;
  applyPreset: (preset: PresetKey) => void;
  setNumSimulationsIdx: (idx: number) => void;
  setSensRangePercent: (p: 15 | 30 | 50) => void;
  setSurprisePercent: (p: number) => void;
  setDispersionPercent: (p: number) => void;
  setDfbAlwaysWins: (v: boolean) => void;
  setSimulationResult: (r: SimulationResult | null) => void;
  setSensitivityResult: (r: SensitivityResult | null) => void;
  setSimState: (s: SimState) => void;
  setLoading: (l: Partial<LoadingState> & { kind?: LoadingKind }) => void;
  resetLoading: () => void;
}

const initialLoading: LoadingState = {
  kind: null,
  phase: "",
  progress: 0,
  counterText: "",
};

export const useSimulationStore = create<SimulationStore>((set) => ({
  algorithm: "v1",
  weights: { ...PRESETS.default },
  activePreset: "default",
  numSimulationsIdx: 2, // 5.000
  sensRangePercent: 30,
  surprisePercent: 0,
  dispersionPercent: 0,
  dfbAlwaysWins: false,

  simulationResult: null,
  sensitivityResult: null,
  simState: "idle",

  loading: initialLoading,

  setAlgorithm: (algorithm) => set({ algorithm }),

  setWeight: (key, value) =>
    set((state) => ({
      weights: { ...state.weights, [key]: value },
      activePreset: null,
    })),

  applyPreset: (preset) =>
    set({ weights: { ...PRESETS[preset] }, activePreset: preset }),

  setNumSimulationsIdx: (idx) => set({ numSimulationsIdx: idx }),

  setSensRangePercent: (p) => set({ sensRangePercent: p }),

  setSurprisePercent: (p) =>
    set({ surprisePercent: Math.max(0, Math.min(100, Math.round(p))) }),

  setDispersionPercent: (p) =>
    set({ dispersionPercent: Math.max(0, Math.min(100, Math.round(p))) }),

  setDfbAlwaysWins: (v) => set({ dfbAlwaysWins: v }),

  setSimulationResult: (r) => set({ simulationResult: r }),
  setSensitivityResult: (r) => set({ sensitivityResult: r }),
  setSimState: (s) => set({ simState: s }),

  setLoading: (l) =>
    set((state) => ({
      loading: { ...state.loading, ...l },
    })),

  resetLoading: () => set({ loading: initialLoading }),
}));

export function selectNumSimulations(state: { numSimulationsIdx: number }): number {
  return SIM_LEVELS[state.numSimulationsIdx];
}
