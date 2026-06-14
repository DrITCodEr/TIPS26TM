import { describe, expect, it } from "vitest";
import { runMonteCarlo } from "@/lib/algorithms/monteCarlo";
import { updateStrengthsFromLive } from "@/lib/algorithms/liveUpdate";
import { TEAMS } from "@/lib/data/teams";
import { SCHEDULE } from "@/lib/data/schedule";
import { MARKT_QUOTEN } from "@/lib/data/marktQuoten";
import { PLAYER_AGGREGATES } from "@/lib/data/playerAggregates";
import { PRESETS } from "@/lib/data/presets";
import { mulberry32 } from "@/lib/algorithms/random";
import type { LiveMatchResult } from "@/lib/data/liveResults";

const DFB_IDX = TEAMS.findIndex((t) => t.name === "Deutschland");

// Erstes DFB-Spiel im Spielplan finden
const firstDfbMatchIdx = SCHEDULE.findIndex(
  (m) => m.teamA === "Deutschland" || m.teamB === "Deutschland",
);

describe("Stufe 1 — Konditionierung auf Live-Ergebnisse", () => {
  it("matchStats spiegeln die Modell-Vorhersage (NICHT das echte Ergebnis), damit das Hit/Miss-Vergleich sinnvoll bleibt", async () => {
    const live: Record<number, LiveMatchResult> = {
      [firstDfbMatchIdx]: { goalsA: 5, goalsB: 1, isFinished: true },
    };

    const N = 500;
    const result = await runMonteCarlo({
      algorithm: "v2",
      weights: PRESETS.default,
      numSimulations: N,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      playerAggregates: PLAYER_AGGREGATES,
      rng: mulberry32(42),
      liveResults: live,
      useLiveResults: true,
    });

    const ms = result.matchStats[firstDfbMatchIdx];
    // matchStats werden gesampelt, NICHT auf das echte 5:1 fixiert →
    // alle drei Outcomes (winA/draw/winB) sind möglich
    expect(ms.winA + ms.draw + ms.winB).toBe(N);
    expect(Math.max(ms.winA, ms.winB, ms.draw)).toBeLessThan(N);
  });

  it("useLiveResults=false ignoriert Live-Ergebnisse vollständig", async () => {
    const live: Record<number, LiveMatchResult> = {
      [firstDfbMatchIdx]: { goalsA: 5, goalsB: 1, isFinished: true },
    };
    const N = 200;
    const result = await runMonteCarlo({
      algorithm: "v2",
      weights: PRESETS.default,
      numSimulations: N,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      playerAggregates: PLAYER_AGGREGATES,
      rng: mulberry32(42),
      liveResults: live,
      useLiveResults: false,
    });
    const ms = result.matchStats[firstDfbMatchIdx];
    // Min eines Outcomes muss < N sein, sonst wurde nicht gesampelt
    expect(Math.max(ms.winA, ms.winB, ms.draw)).toBeLessThan(N);
  });

  it("conditioning beeinflusst Gruppen-Tabelle und damit Titelchancen", async () => {
    // Setup: Deutschland gewinnt alle 3 Gruppenspiele 5:0
    const dfbMatches = SCHEDULE.map((m, i) => ({ m, i })).filter(
      ({ m }) => m.teamA === "Deutschland" || m.teamB === "Deutschland",
    );
    const live: Record<number, LiveMatchResult> = {};
    for (const { m, i } of dfbMatches) {
      const dfbIsA = m.teamA === "Deutschland";
      live[i] = {
        goalsA: dfbIsA ? 5 : 0,
        goalsB: dfbIsA ? 0 : 5,
        isFinished: true,
      };
    }

    const N = 500;
    const baseResult = await runMonteCarlo({
      algorithm: "v2",
      weights: PRESETS.default,
      numSimulations: N,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      playerAggregates: PLAYER_AGGREGATES,
      rng: mulberry32(7),
      useLiveResults: false,
    });
    const condResult = await runMonteCarlo({
      algorithm: "v2",
      weights: PRESETS.default,
      numSimulations: N,
      teams: TEAMS,
      schedule: SCHEDULE,
      marktQuoten: MARKT_QUOTEN,
      playerAggregates: PLAYER_AGGREGATES,
      rng: mulberry32(7),
      liveResults: live,
      useLiveResults: true,
    });

    // Konditionierte Sim: DFB sollte häufiger als Gruppensieger landen
    const dfbBaseFirst = baseResult.groupRankStats[DFB_IDX][0];
    const dfbCondFirst = condResult.groupRankStats[DFB_IDX][0];
    expect(dfbCondFirst).toBeGreaterThanOrEqual(dfbBaseFirst);
  });
});

describe("Stufe 2 — Bayes-Update der Stärken", () => {
  it("α=0 lässt Stärken unverändert", () => {
    const base = TEAMS.map((_, i) => 0.5 + (i % 5) * 0.05);
    const live: Record<number, LiveMatchResult> = {
      [firstDfbMatchIdx]: { goalsA: 3, goalsB: 0, isFinished: true },
    };
    const out = updateStrengthsFromLive(base, live, SCHEDULE, 0);
    expect(out).toEqual(base);
  });

  it("Sieg gegen schwächeren Gegner schiebt Stärke leicht nach oben", () => {
    const base = TEAMS.map(() => 0.5);
    const m = SCHEDULE[firstDfbMatchIdx];
    const a = m.idxA!;
    const b = m.idxB!;
    base[a] = 0.7; // A klar stärker als B
    base[b] = 0.3;
    // Erwartete Sieger gewinnt knapp 1:0 — kleines Update
    const live: Record<number, LiveMatchResult> = {
      [firstDfbMatchIdx]: { goalsA: 1, goalsB: 0, isFinished: true },
    };
    const out = updateStrengthsFromLive(base, live, SCHEDULE, 1.0);
    // Erwartungsgemäßer Sieg ändert wenig (residual ≈ 0)
    expect(Math.abs(out[a] - base[a])).toBeLessThan(0.02);
    expect(Math.abs(out[b] - base[b])).toBeLessThan(0.02);
  });

  it("Upset (schwächeres Team gewinnt hoch) schiebt Stärken stark", () => {
    const base = TEAMS.map(() => 0.5);
    const m = SCHEDULE[firstDfbMatchIdx];
    const a = m.idxA!;
    const b = m.idxB!;
    base[a] = 0.8; // A klar Favorit
    base[b] = 0.2;
    // Aber B gewinnt 4:0 — riesiges Upset
    const live: Record<number, LiveMatchResult> = {
      [firstDfbMatchIdx]: { goalsA: 0, goalsB: 4, isFinished: true },
    };
    const out = updateStrengthsFromLive(base, live, SCHEDULE, 1.0);
    expect(out[a]).toBeLessThan(base[a]); // A wird schwächer
    expect(out[b]).toBeGreaterThan(base[b]); // B wird stärker
    // Substantieller Shift
    expect(base[a] - out[a]).toBeGreaterThan(0.03);
    expect(out[b] - base[b]).toBeGreaterThan(0.03);
  });

  it("Stärken bleiben in [0.05, 0.95] geklemmt", () => {
    const base = TEAMS.map(() => 0.5);
    const m = SCHEDULE[firstDfbMatchIdx];
    base[m.idxA!] = 0.94;
    base[m.idxB!] = 0.06;
    const live: Record<number, LiveMatchResult> = {
      [firstDfbMatchIdx]: { goalsA: 9, goalsB: 0, isFinished: true },
    };
    const out = updateStrengthsFromLive(base, live, SCHEDULE, 1.0);
    expect(out[m.idxA!]).toBeLessThanOrEqual(0.95);
    expect(out[m.idxB!]).toBeGreaterThanOrEqual(0.05);
  });

  it("nicht beendete Matches werden ignoriert", () => {
    const base = TEAMS.map(() => 0.5);
    const live: Record<number, LiveMatchResult> = {
      [firstDfbMatchIdx]: { goalsA: 5, goalsB: 0, isFinished: false },
    };
    const out = updateStrengthsFromLive(base, live, SCHEDULE, 1.0);
    expect(out).toEqual(base);
  });
});
