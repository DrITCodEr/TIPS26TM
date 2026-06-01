import { create } from "zustand";
import type {
  AlgorithmVersion,
  SimulationResult,
} from "@lib/types/simulation";
import type { FactorWeights } from "@lib/types/factors";
import { PRESETS, type PresetKey } from "@lib/data/presets";
import type { SensitivityResult } from "@lib/algorithms/sensitivity";

export const SIM_LEVELS = [
  1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000,
] as const;

export type LoadingKind = "simulation" | "sensitivity" | null;
export interface LoadingState {
  kind: LoadingKind;
  phase: string;
  progress: number;
  counterText: string;
}
const initialLoading: LoadingState = {
  kind: null,
  phase: "",
  progress: 0,
  counterText: "",
};

interface State {
  algorithm: AlgorithmVersion;
  weights: FactorWeights;
  activePreset: PresetKey | null;
  numSimulationsIdx: number;
  sensRangePercent: 15 | 30 | 50;
  /** 0..100 — orthogonaler Tagesform-Slider, wirkt auf alle Algorithmen */
  surprisePercent: number;
  /** 0..100 — Tor-Streuung (Negativ-Binomial-Overdispersion) */
  dispersionPercent: number;
  simulationResult: SimulationResult | null;
  sensitivityResult: SensitivityResult | null;
  loading: LoadingState;
  // backtest UI state
  backtestYear: 2014 | 2018 | 2022;
  backtestAlgorithm: "v1" | "v2-nomarket";

  setAlgorithm: (a: AlgorithmVersion) => void;
  setWeight: (k: keyof FactorWeights, v: number) => void;
  applyPreset: (p: PresetKey) => void;
  setNumSimulationsIdx: (i: number) => void;
  setSensRangePercent: (p: 15 | 30 | 50) => void;
  setSurprisePercent: (p: number) => void;
  setDispersionPercent: (p: number) => void;
  setSimulationResult: (r: SimulationResult | null) => void;
  setSensitivityResult: (r: SensitivityResult | null) => void;
  setLoading: (l: Partial<LoadingState> & { kind?: LoadingKind }) => void;
  resetLoading: () => void;
  setBacktestYear: (y: 2014 | 2018 | 2022) => void;
  setBacktestAlgorithm: (a: "v1" | "v2-nomarket") => void;
}

export const useStore = create<State>((set) => ({
  algorithm: "v2",
  weights: { ...PRESETS.default },
  activePreset: "default",
  numSimulationsIdx: 2,
  sensRangePercent: 30,
  surprisePercent: 0,
  dispersionPercent: 0,
  simulationResult: null,
  sensitivityResult: null,
  loading: initialLoading,
  backtestYear: 2022,
  backtestAlgorithm: "v1",

  setAlgorithm: (algorithm) => set({ algorithm }),
  setWeight: (k, v) =>
    set((s) => ({ weights: { ...s.weights, [k]: v }, activePreset: null })),
  applyPreset: (p) => set({ weights: { ...PRESETS[p] }, activePreset: p }),
  setNumSimulationsIdx: (i) => set({ numSimulationsIdx: i }),
  setSensRangePercent: (p) => set({ sensRangePercent: p }),
  setSurprisePercent: (p) =>
    set({ surprisePercent: Math.max(0, Math.min(100, Math.round(p))) }),
  setDispersionPercent: (p) =>
    set({ dispersionPercent: Math.max(0, Math.min(100, Math.round(p))) }),
  setSimulationResult: (r) => set({ simulationResult: r }),
  setSensitivityResult: (r) => set({ sensitivityResult: r }),
  setLoading: (l) => set((s) => ({ loading: { ...s.loading, ...l } })),
  resetLoading: () => set({ loading: initialLoading }),
  setBacktestYear: (y) => set({ backtestYear: y }),
  setBacktestAlgorithm: (a) => set({ backtestAlgorithm: a }),
}));

export function selectNumSimulations(state: { numSimulationsIdx: number }): number {
  return SIM_LEVELS[state.numSimulationsIdx];
}
