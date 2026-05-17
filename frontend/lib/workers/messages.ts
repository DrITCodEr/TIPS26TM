import type { FactorWeights } from "@/lib/types/factors";
import type {
  AlgorithmVersion,
  SimulationResult,
} from "@/lib/types/simulation";
import type { SensitivityResult } from "@/lib/algorithms/sensitivity";

export interface SimulateRequest {
  type: "simulate";
  algorithm: AlgorithmVersion;
  weights: FactorWeights;
  numSimulations: number;
}

export interface SensitivityRequest {
  type: "sensitivity";
  algorithm: AlgorithmVersion;
  baseWeights: FactorWeights;
  rangePercent: 15 | 30 | 50;
  numPerturbations: number;
  numSubSimulations: number;
}

export type WorkerRequest = SimulateRequest | SensitivityRequest;

export interface ProgressMessage {
  type: "progress";
  value: number; // 0..1
}

export interface SimulationResultMessage {
  type: "simulationResult";
  value: SimulationResult;
}

export interface SensitivityResultMessage {
  type: "sensitivityResult";
  value: SensitivityResult;
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export type WorkerResponse =
  | ProgressMessage
  | SimulationResultMessage
  | SensitivityResultMessage
  | ErrorMessage;
