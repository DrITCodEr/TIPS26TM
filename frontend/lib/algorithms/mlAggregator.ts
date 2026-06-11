/**
 * ML-Aggregator-Schnittstelle für Phase 8.2 (XGBoost via ONNX im Browser).
 *
 * Status: **Stub**. Sobald `scripts/train_aggregator.py` ein .onnx-Modell
 * unter `frontend/public/models/aggregator.onnx` ablegt, wird dieses Modul
 * via `onnxruntime-web` initialisiert und liefert echte Inferenz.
 *
 * Bis dahin fällt jeder Aufruf auf den Ensemble-Stacker v4 zurück (siehe
 * `lib/algorithms/tips26v4.ts`), damit der Code-Pfad immer funktioniert.
 */

import type { ForecastTriple } from "./metrics";

export interface MatchFeatures {
  /** Pre-Match-Stärke Team A (v3-Skala) */
  strengthA: number;
  /** Pre-Match-Stärke Team B (v3-Skala) */
  strengthB: number;
  /** Markt-implizite W/D/L-Wahrscheinlichkeit (sofern verfügbar) */
  marketWinA?: number;
  marketDraw?: number;
  marketWinB?: number;
  /** Squad-xG-Differenz (offensive minus defensive Erwartung) */
  xgDiffA?: number;
  xgDiffB?: number;
}

export interface MLAggregatorStatus {
  loaded: boolean;
  modelPath?: string;
  error?: string;
}

let _session: unknown | null = null;
let _status: MLAggregatorStatus = { loaded: false };

const MODEL_PATH = "/models/aggregator.onnx";

/**
 * Lade das ONNX-Modell (idempotent). Wenn das Modell nicht existiert oder
 * onnxruntime-web nicht verfügbar ist, bleibt der Status "not loaded" und
 * Inferenz-Aufrufe fallen auf den Stacker-Fallback.
 *
 * Dieser Loader läuft NUR im Browser. In Tests / SSR ist `window` undefined,
 * dann gibt's einen sofortigen No-Op.
 */
export async function loadAggregatorModel(): Promise<MLAggregatorStatus> {
  if (typeof window === "undefined") {
    _status = { loaded: false, error: "SSR — kein Browser-Kontext" };
    return _status;
  }
  if (_session) return _status;

  try {
    const ort = await import("onnxruntime-web");
    const response = await fetch(MODEL_PATH);
    if (!response.ok) {
      _status = {
        loaded: false,
        error: `Modell unter ${MODEL_PATH} nicht gefunden (Status ${response.status}).`,
      };
      return _status;
    }
    const buffer = await response.arrayBuffer();
    _session = await ort.InferenceSession.create(buffer);
    _status = { loaded: true, modelPath: MODEL_PATH };
  } catch (err) {
    _session = null;
    _status = {
      loaded: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
  return _status;
}

export function getAggregatorStatus(): MLAggregatorStatus {
  return _status;
}

/**
 * Inferenz-Stub. Solange kein .onnx-Modell geladen ist, gibt diese Funktion
 * `null` zurück und der Aufrufer fällt auf v4-Stacker.
 *
 * Sobald das Modell verfügbar ist, transformiert sie `MatchFeatures` in
 * den erwarteten Float32Array-Input und parst den Output zu ForecastTriple.
 */
export async function predictMatchOutcome(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  features: MatchFeatures,
): Promise<ForecastTriple | null> {
  if (!_session) return null;
  // Hier landet die Implementierung sobald wir ein konkretes Modell-Schema
  // haben (Input-Shape, Klassen-Reihenfolge). Bis dahin sicher als no-op.
  return null;
}
