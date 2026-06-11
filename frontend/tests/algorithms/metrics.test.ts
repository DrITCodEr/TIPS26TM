import { describe, expect, it } from "vitest";
import {
  aggregateMetrics,
  brierScore,
  calibrationBins,
  logLoss,
  rankedProbabilityScore,
} from "@/lib/algorithms/metrics";

describe("brierScore", () => {
  it("is 0 for a perfect forecast", () => {
    expect(brierScore({ winA: 1, draw: 0, winB: 0 }, "1")).toBe(0);
    expect(brierScore({ winA: 0, draw: 1, winB: 0 }, "X")).toBe(0);
    expect(brierScore({ winA: 0, draw: 0, winB: 1 }, "2")).toBe(0);
  });

  it("equals 2 for a worst-case forecast", () => {
    expect(brierScore({ winA: 0, draw: 0, winB: 1 }, "1")).toBe(2);
    expect(brierScore({ winA: 1, draw: 0, winB: 0 }, "2")).toBe(2);
  });

  it("equals ~0.667 for a uniform forecast", () => {
    const bs = brierScore({ winA: 1 / 3, draw: 1 / 3, winB: 1 / 3 }, "1");
    expect(bs).toBeCloseTo(2 / 3, 4);
  });

  it("normalizes unscaled inputs", () => {
    const bs1 = brierScore({ winA: 2, draw: 0, winB: 0 }, "1");
    const bs2 = brierScore({ winA: 1, draw: 0, winB: 0 }, "1");
    expect(bs1).toBe(bs2);
  });
});

describe("logLoss", () => {
  it("approaches 0 for a near-perfect forecast", () => {
    expect(logLoss({ winA: 0.99, draw: 0.005, winB: 0.005 }, "1")).toBeLessThan(
      0.02,
    );
  });

  it("is large for a confident wrong forecast", () => {
    expect(logLoss({ winA: 0.99, draw: 0.005, winB: 0.005 }, "2")).toBeGreaterThan(
      4,
    );
  });

  it("equals ln(3) ≈ 1.099 for a uniform forecast", () => {
    expect(
      logLoss({ winA: 1 / 3, draw: 1 / 3, winB: 1 / 3 }, "1"),
    ).toBeCloseTo(Math.log(3), 6);
  });
});

describe("rankedProbabilityScore", () => {
  it("is 0 for a perfect forecast", () => {
    expect(
      rankedProbabilityScore({ winA: 1, draw: 0, winB: 0 }, "1"),
    ).toBeCloseTo(0, 10);
  });

  it("penalizes farther-off outcomes more", () => {
    // Forecast says strong "1", actual is "2" (far) vs "X" (close)
    const far = rankedProbabilityScore({ winA: 1, draw: 0, winB: 0 }, "2");
    const close = rankedProbabilityScore({ winA: 1, draw: 0, winB: 0 }, "X");
    expect(far).toBeGreaterThan(close);
  });
});

describe("aggregateMetrics", () => {
  it("returns zeros for empty input", () => {
    const m = aggregateMetrics([], []);
    expect(m.count).toBe(0);
    expect(m.brier).toBe(0);
    expect(m.accuracy).toBe(0);
  });

  it("computes correct accuracy when forecasts match actuals", () => {
    const m = aggregateMetrics(
      [
        { winA: 0.8, draw: 0.1, winB: 0.1 },
        { winA: 0.1, draw: 0.7, winB: 0.2 },
        { winA: 0.2, draw: 0.1, winB: 0.7 },
      ],
      ["1", "X", "2"],
    );
    expect(m.accuracy).toBe(1);
  });

  it("rejects length mismatch", () => {
    expect(() =>
      aggregateMetrics(
        [{ winA: 1, draw: 0, winB: 0 }],
        ["1", "X"],
      ),
    ).toThrow();
  });
});

describe("calibrationBins", () => {
  it("matches observed ≈ predicted for well-calibrated forecasts", () => {
    // Synthetisches Beispiel: jeder Outcome gleich wahrscheinlich, Forecasts
    // sind ebenfalls uniform → observed sollte ≈ predicted sein.
    const forecasts = Array.from({ length: 300 }, () => ({
      winA: 1 / 3,
      draw: 1 / 3,
      winB: 1 / 3,
    }));
    const actuals = Array.from({ length: 300 }, (_, i) =>
      i % 3 === 0 ? "1" : i % 3 === 1 ? "X" : ("2" as const),
    ) as Array<"1" | "X" | "2">;

    const bins = calibrationBins(forecasts, actuals, 10);
    const populated = bins.filter((b) => b.count > 0);
    for (const b of populated) {
      expect(Math.abs(b.observed - b.predicted)).toBeLessThan(0.1);
    }
  });
});
