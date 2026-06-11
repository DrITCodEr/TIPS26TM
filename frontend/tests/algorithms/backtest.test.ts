import { describe, expect, it } from "vitest";
import { checkChampionRanks, runBacktest } from "@/lib/algorithms/backtest";
import {
  analyticMatchProbs_v1,
  analyticMatchProbs_v2,
} from "@/lib/algorithms/matchProbs";
import { WM_2014, WM_2018, WM_2022 } from "@/lib/data/historical";
import { PRESETS } from "@/lib/data/presets";

describe("analyticMatchProbs", () => {
  it("v1: sums to 1 for any strength pair", () => {
    const cases: [number, number][] = [
      [0.5, 0.5],
      [0.8, 0.2],
      [0.1, 0.9],
      [0.7, 0.3],
    ];
    for (const [sA, sB] of cases) {
      const f = analyticMatchProbs_v1(sA, sB);
      expect(f.winA + f.draw + f.winB).toBeCloseTo(1, 4);
    }
  });

  it("v1: stronger team gets higher win probability", () => {
    const f = analyticMatchProbs_v1(0.8, 0.2);
    expect(f.winA).toBeGreaterThan(f.winB);
    expect(f.winA).toBeGreaterThan(0.6);
  });

  it("v1: symmetric strengths produce symmetric outcomes", () => {
    const f = analyticMatchProbs_v1(0.5, 0.5);
    expect(f.winA).toBeCloseTo(f.winB, 4);
  });

  it("v2: Dixon-Coles correction lifts P(draw) vs no-correction baseline", () => {
    const withDC = analyticMatchProbs_v2(0.5, 0.5, -0.13);
    const noDC = analyticMatchProbs_v2(0.5, 0.5, 0);
    expect(withDC.draw).toBeGreaterThan(noDC.draw);
  });
});

describe("runBacktest", () => {
  it("returns metrics for WM 2022 K.o.-phase", () => {
    const report = runBacktest(WM_2022, PRESETS.default, "v1");
    expect(report.year).toBe(2022);
    expect(report.metrics.count).toBe(WM_2022.matches.length);
    expect(report.metrics.brier).toBeGreaterThan(0);
    expect(report.metrics.brier).toBeLessThan(2);
    expect(report.metrics.logLoss).toBeGreaterThan(0);
  });

  it("returns one forecast per match", () => {
    const report = runBacktest(WM_2018, PRESETS.default, "v1");
    expect(report.perMatch).toHaveLength(WM_2018.matches.length);
    for (const p of report.perMatch) {
      expect(p.forecast.winA + p.forecast.draw + p.forecast.winB).toBeCloseTo(
        1,
        4,
      );
    }
  });

  it("performs better than a uniform forecast (Brier < 0.667)", () => {
    // Bei nur 16 K.o.-Spielen ist die Stichprobe klein; trotzdem sollte
    // das Modell mit echten Pre-Turnier-Werten deutlich besser als
    // Zufallsraten sein.
    for (const t of [WM_2014, WM_2018, WM_2022]) {
      const report = runBacktest(t, PRESETS.default, "v1");
      expect(report.metrics.brier).toBeLessThan(0.66);
    }
  });

  it("v2-nomarket produces different forecasts than v1", () => {
    const v1 = runBacktest(WM_2022, PRESETS.default, "v1");
    const v2 = runBacktest(WM_2022, PRESETS.default, "v2-nomarket");
    expect(v1.metrics.brier).not.toBe(v2.metrics.brier);
  });

  it("supports both algorithms without crashing", () => {
    for (const algo of ["v1", "v2-nomarket"] as const) {
      const r = runBacktest(WM_2014, PRESETS.default, algo);
      expect(r.metrics.count).toBe(WM_2014.matches.length);
    }
  });
});

describe("checkChampionRanks", () => {
  it("ranks actual champion in the top half for every historical WM", () => {
    for (const t of [WM_2014, WM_2018, WM_2022]) {
      const info = checkChampionRanks(t, PRESETS.default);
      expect(info.championRank).toBeLessThanOrEqual(t.teams.length / 2);
    }
  });

  it("WM 2014: Deutschland was the champion and should rank top-5", () => {
    const info = checkChampionRanks(WM_2014, PRESETS.default);
    expect(info.topNContainsChampion(5)).toBe(true);
  });
});
