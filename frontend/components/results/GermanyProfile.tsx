"use client";

import { DfbCheatToggle } from "@/components/setup/DfbCheatToggle";
import { useSimulationStore } from "@/lib/stores/simulationStore";
import { TEAMS } from "@/lib/data/teams";
import { SCHEDULE } from "@/lib/data/schedule";
import { FAKTOREN } from "@/lib/data/factors";
import { PLAYER_AGGREGATES } from "@/lib/data/playerAggregates";
import { normalizeFactor } from "@/lib/algorithms/normalize";
import { AlgorithmBadge } from "@/components/ui/AlgorithmBadge";
import { SectionTitle, Card } from "@/components/ui/Card";
import { InfoBanner } from "@/components/ui/InfoBanner";

const DFB_NAME = "Deutschland";

export function GermanyProfile() {
  const result = useSimulationStore((s) => s.simulationResult);

  const dtIdx = TEAMS.findIndex((t) => t.name === DFB_NAME);
  const dt = TEAMS[dtIdx];

  // Stärken-Profil (immer verfügbar, unabhängig von Simulation)
  const profile = FAKTOREN.map((f) => ({
    f,
    norm: normalizeFactor(TEAMS, f.key)[dtIdx],
  }));

  const dtMatches = SCHEDULE.map((m, i) => ({ m, i })).filter(
    ({ m }) => m.teamA === DFB_NAME || m.teamB === DFB_NAME,
  );

  return (
    <>
      <AlgorithmBadge />
      <div
        className="rounded-2xl p-4 mb-3"
        style={{
          background:
            "linear-gradient(135deg, #142941 0%, #1a3258 60%, #142941 100%)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
        }}
      >
        <div
          className="inline-block text-[10px] font-bold px-2 py-1 rounded-full mb-3"
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            color: "#fca5a5",
          }}
        >
          🇩🇪 DEUTSCHLAND
        </div>
        <h2
          className="text-[20px] font-extrabold leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          DFB-Team in
          <br />
          <span style={{ color: "var(--mint)" }}>Gruppe E</span>
        </h2>
        <div
          className="text-[12px] mt-2"
          style={{ color: "var(--text-secondary)" }}
        >
          🇨🇼 Curaçao · 🇨🇮 Elfenbeinküste · 🇪🇨 Ecuador
        </div>
      </div>

      <SectionTitle>⚽ Die 3 Gruppenspiele</SectionTitle>
      <div className="space-y-2">
        {dtMatches.map(({ m, i }) => {
          const isHomeDFB = m.teamA === DFB_NAME;
          const opp = isHomeDFB ? m.teamB : m.teamA;
          const oppTeam = TEAMS.find((t) => t.name === opp)!;
          let winDFB = 0,
            draw = 0,
            winOpp = 0,
            avgDFB = "?",
            avgOpp = "?",
            topScore = "—";
          if (result) {
            const ms = result.matchStats[i];
            const N = result.numSimulations;
            winDFB = ((isHomeDFB ? ms.winA : ms.winB) / N) * 100;
            draw = (ms.draw / N) * 100;
            winOpp = ((isHomeDFB ? ms.winB : ms.winA) / N) * 100;
            avgDFB = (
              (isHomeDFB ? ms.goalsA : ms.goalsB) / N
            ).toFixed(1);
            avgOpp = (
              (isHomeDFB ? ms.goalsB : ms.goalsA) / N
            ).toFixed(1);
            const top = Object.entries(ms.scores).sort(
              (a, b) => b[1] - a[1],
            )[0];
            if (top) {
              const [score, count] = top;
              const oriented = isHomeDFB
                ? score
                : score.split("-").reverse().join("-");
              topScore = `${oriented} · ${((count / N) * 100).toFixed(0)}%`;
            }
          }
          return (
            <Card key={i}>
              <div
                className="text-[10px] mb-2"
                style={{ color: "var(--text-tertiary)" }}
              >
                {m.date} · {m.time} · {m.venue}
              </div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[20px]">🇩🇪</span>
                  <span className="text-[13px] font-bold">Deutschland</span>
                </div>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  vs
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold">{oppTeam.name}</span>
                  <span className="text-[20px]">{oppTeam.flag}</span>
                </div>
              </div>
              {result ? (
                <>
                  <div
                    className="flex h-2 rounded-full overflow-hidden mb-1"
                    style={{ background: "var(--bg-tertiary)" }}
                  >
                    <div
                      style={{ width: `${winDFB}%`, background: "var(--germany-red)" }}
                    />
                    <div
                      style={{ width: `${draw}%`, background: "rgba(148, 163, 184, 0.5)" }}
                    />
                    <div
                      style={{ width: `${winOpp}%`, background: "var(--mint-dark)" }}
                    />
                  </div>
                  <div
                    className="flex justify-between text-[10px] font-bold tabular-nums"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span>🇩🇪 {winDFB.toFixed(0)}%</span>
                    <span>X {draw.toFixed(0)}%</span>
                    <span>{winOpp.toFixed(0)}% {oppTeam.flag}</span>
                  </div>
                  <div
                    className="mt-2 pt-2 text-[10px] flex justify-between"
                    style={{
                      borderTop: "1px solid var(--border-subtle)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    <span>
                      ⌀ Tore:{" "}
                      <strong style={{ color: "var(--text-primary)" }}>
                        {avgDFB} : {avgOpp}
                      </strong>
                    </span>
                    <span>
                      Top:{" "}
                      <strong style={{ color: "var(--mint)" }}>{topScore}</strong>
                    </span>
                  </div>
                </>
              ) : (
                <div
                  className="text-[11px] italic"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Starte die Simulation, um Wahrscheinlichkeiten zu sehen.
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <SectionTitle>🎯 K.o.-Wege</SectionTitle>
      <Card className="mb-2">
        <h3
          className="text-[13px] font-bold mb-1.5"
          style={{ color: "var(--mint)" }}
        >
          Bei Gruppensieg (Platz 1)
        </h3>
        <ul className="space-y-1 text-[11px]" style={{ color: "var(--text-secondary)" }}>
          <li>• <strong>1/16:</strong> Mo, 29.06. · Foxborough (Gillette)</li>
          <li>• <strong>Achtel:</strong> Sa, 04.07. · Philadelphia</li>
          <li>• <strong>Viertel:</strong> Do, 09.07. · Boston</li>
        </ul>
      </Card>
      <Card>
        <h3
          className="text-[13px] font-bold mb-1.5"
          style={{ color: "var(--mint)" }}
        >
          Bei Platz 2
        </h3>
        <ul className="space-y-1 text-[11px]" style={{ color: "var(--text-secondary)" }}>
          <li>• <strong>1/16:</strong> Di, 30.06. · Arlington/Dallas vs. 2. Gruppe I</li>
          <li>• <strong>Achtel:</strong> So, 05.07. · Houston</li>
        </ul>
      </Card>

      <SectionTitle>🧬 Player-Aggregates (für TIPS-26.3)</SectionTitle>
      <Card>
        {(() => {
          const dtAgg = PLAYER_AGGREGATES[DFB_NAME];
          const rows: { label: string; value: string; hint?: string }[] = [
            { label: "Top-11-Marktwert", value: `${dtAgg.top11Markt} Mio €` },
            { label: "% in Top-5-Ligen", value: `${Math.round(dtAgg.pctTop5Ligen * 100)} %`, hint: "EPL/LaLiga/Bundesliga/SerieA/Ligue1" },
            { label: "UCL-Spieler", value: `${dtAgg.uclSpieler}/23`, hint: "regelmäßig in der UCL aktiv" },
            { label: "Squad-xG (off.)", value: `${dtAgg.xgAttacke.toFixed(1)} / Spiel`, hint: "erwartete Tore Stürmer + offMittelfeld" },
            { label: "xGA (def.)", value: `${dtAgg.xgaDefense.toFixed(1)} / Spiel`, hint: "erwartete Gegentore Defensive — niedriger ist besser" },
            { label: "GK Post-Shot xG Save %", value: `${(dtAgg.gkPsxg * 100).toFixed(0)} %`, hint: "Stamm-Torhüter Save-Rate vs xG" },
          ];
          return (
            <div className="space-y-2">
              {rows.map((r) => (
                <div
                  key={r.label}
                  className="flex items-baseline justify-between gap-2"
                >
                  <div>
                    <div className="text-[11px] font-semibold">{r.label}</div>
                    {r.hint && (
                      <div
                        className="text-[9px]"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {r.hint}
                      </div>
                    )}
                  </div>
                  <div
                    className="text-[12px] font-extrabold tabular-nums shrink-0"
                    style={{ color: "var(--mint)" }}
                  >
                    {r.value}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
        <div
          className="text-[9px] mt-3 pt-2"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            color: "var(--text-tertiary)",
          }}
        >
          Demo-Daten. Echte Werte via fbref-/transfermarkt-Scraping (Roadmap §9.2).
        </div>
      </Card>

      <SectionTitle>🎉 Spaß-Modus</SectionTitle>
      <DfbCheatToggle />

      <SectionTitle>💪 Stärken-Profil</SectionTitle>
      <Card>
        <div className="space-y-2">
          {profile.map(({ f, norm }) => (
            <div key={f.key}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-semibold">
                  {f.icon} {f.label}
                </span>
                <span
                  className="text-[11px] font-extrabold tabular-nums"
                  style={{ color: "var(--mint)" }}
                >
                  {(norm * 100).toFixed(0)}/100
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${norm * 100}%`,
                    background:
                      "linear-gradient(to right, var(--mint-dark), var(--mint))",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <InfoBanner icon="★" tone="germany" className="mt-3">
          <strong>Schlüsselspieler:</strong> Florian Wirtz, Jamal Musiala, Kai
          Havertz, Joshua Kimmich (C), Antonio Rüdiger, Jonathan Tah. Trainer:
          Julian Nagelsmann. Kader-Marktwert ≈ {dt.markt} Mio. €.
        </InfoBanner>
      </Card>
    </>
  );
}
