import { useStore } from "@/store";
import { TEAMS } from "@lib/data/teams";
import { SCHEDULE } from "@lib/data/schedule";
import { FAKTOREN } from "@lib/data/factors";
import { PLAYER_AGGREGATES } from "@lib/data/playerAggregates";
import { normalizeFactor } from "@lib/algorithms/normalize";
import { AlgorithmBadge, Card, InfoBanner, SectionTitle } from "./ui";

const DFB = "Deutschland";

export function GermanyTab() {
  const result = useStore((s) => s.simulationResult);
  const algorithm = useStore((s) => s.algorithm);
  const dtIdx = TEAMS.findIndex((t) => t.name === DFB);
  const dt = TEAMS[dtIdx];
  const dtAgg = PLAYER_AGGREGATES[DFB];

  const profile = FAKTOREN.map((f) => ({
    f,
    norm: normalizeFactor(TEAMS, f.key)[dtIdx],
  }));

  const dtMatches = SCHEDULE.map((m, i) => ({ m, i })).filter(({ m }) =>
    m.teamA === DFB || m.teamB === DFB,
  );

  return (
    <section>
      <AlgorithmBadge algorithm={result?.algorithm ?? algorithm} />
      <div
        style={{
          padding: 16, borderRadius: 16, marginBottom: 12,
          background: "linear-gradient(135deg, #142941 0%, #1a3258 60%, #142941 100%)",
          border: "1px solid rgba(239,68,68,0.3)",
        }}
      >
        <div style={{
          display: "inline-block", fontSize: 10, fontWeight: 700,
          padding: "4px 8px", borderRadius: 999, marginBottom: 12,
          background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)",
          color: "#fca5a5",
        }}>🇩🇪 DEUTSCHLAND</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          DFB-Team in<br /><span style={{ color: "var(--mint)" }}>Gruppe E</span>
        </h2>
        <div style={{ fontSize: 12, marginTop: 8, color: "var(--text-secondary)" }}>
          🇨🇼 Curaçao · 🇨🇮 Elfenbeinküste · 🇪🇨 Ecuador
        </div>
      </div>

      <SectionTitle>⚽ Die 3 Gruppenspiele</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {dtMatches.map(({ m, i }) => {
          const isHome = m.teamA === DFB;
          const opp = isHome ? m.teamB : m.teamA;
          const oppT = TEAMS.find((t) => t.name === opp)!;
          let winDFB = 0, draw = 0, winOpp = 0, avgDFB = "—", avgOpp = "—", topScore = "—";
          if (result) {
            const ms = result.matchStats[i];
            const N = result.numSimulations;
            winDFB = ((isHome ? ms.winA : ms.winB) / N) * 100;
            draw = (ms.draw / N) * 100;
            winOpp = ((isHome ? ms.winB : ms.winA) / N) * 100;
            avgDFB = ((isHome ? ms.goalsA : ms.goalsB) / N).toFixed(1);
            avgOpp = ((isHome ? ms.goalsB : ms.goalsA) / N).toFixed(1);
            const top = Object.entries(ms.scores).sort((a, b) => b[1] - a[1])[0];
            if (top) {
              const score = isHome ? top[0] : top[0].split("-").reverse().join("-");
              topScore = `${score} · ${((top[1] / N) * 100).toFixed(0)}%`;
            }
          }
          return (
            <Card key={i}>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginBottom: 8 }}>
                {m.date} · {m.time} · {m.venue}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>🇩🇪</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Deutschland</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)" }}>vs</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{oppT.name}</span>
                  <span style={{ fontSize: 20 }}>{oppT.flag}</span>
                </div>
              </div>
              {result ? (
                <>
                  <div className="match-bars">
                    <div style={{ width: `${winDFB}%`, background: "var(--germany-red)" }} />
                    <div className="match-bar-x" style={{ width: `${draw}%` }} />
                    <div className="match-bar-b" style={{ width: `${winOpp}%` }} />
                  </div>
                  <div className="match-pcts">
                    <span>🇩🇪 {winDFB.toFixed(0)}%</span>
                    <span>X {draw.toFixed(0)}%</span>
                    <span>{winOpp.toFixed(0)}% {oppT.flag}</span>
                  </div>
                  <div className="match-footer">
                    <span>⌀ Tore: <strong style={{ color: "var(--text-primary)" }}>{avgDFB} : {avgOpp}</strong></span>
                    <span>Top: <strong style={{ color: "var(--mint)" }}>{topScore}</strong></span>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 11, fontStyle: "italic", color: "var(--text-tertiary)" }}>
                  Starte die Simulation, um Wahrscheinlichkeiten zu sehen.
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <SectionTitle>🎯 K.o.-Wege</SectionTitle>
      <Card style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--mint)", marginBottom: 6 }}>Bei Gruppensieg (Platz 1)</h3>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          • <strong>R32:</strong> 29.06. · Foxborough · vs 3ABCDF<br />
          • <strong>Achtel:</strong> 04.07. · Philadelphia<br />
          • <strong>Viertel:</strong> 09.07. · Boston
        </div>
      </Card>
      <Card>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--mint)", marginBottom: 6 }}>Bei Platz 2</h3>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          • <strong>R32:</strong> 30.06. · Arlington · vs 2I<br />
          • <strong>Achtel:</strong> 05.07. · Houston
        </div>
      </Card>

      <SectionTitle>🧬 Player-Aggregates (TIPS-26.3)</SectionTitle>
      <Card>
        {[
          { label: "Top-11-Marktwert", value: `${dtAgg.top11Markt} Mio €` },
          { label: "% in Top-5-Ligen", value: `${Math.round(dtAgg.pctTop5Ligen * 100)} %` },
          { label: "UCL-Spieler", value: `${dtAgg.uclSpieler}/23` },
          { label: "Squad-xG (off.)", value: `${dtAgg.xgAttacke.toFixed(1)} /Spiel` },
          { label: "xGA (def.)", value: `${dtAgg.xgaDefense.toFixed(1)} /Spiel` },
          { label: "GK Post-Shot xG Save %", value: `${(dtAgg.gkPsxg * 100).toFixed(0)} %` },
        ].map((r) => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span style={{ fontSize: 11, fontWeight: 600 }}>{r.label}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--mint)", fontVariantNumeric: "tabular-nums" }}>{r.value}</span>
          </div>
        ))}
      </Card>

      <SectionTitle>💪 Stärken-Profil</SectionTitle>
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {profile.map(({ f, norm }) => (
            <div key={f.key}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{f.icon} {f.label}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--mint)", fontVariantNumeric: "tabular-nums" }}>{(norm * 100).toFixed(0)}/100</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "var(--bg-tertiary)", overflow: "hidden" }}>
                <div style={{ width: `${norm * 100}%`, height: "100%", background: "linear-gradient(to right, var(--mint-dark), var(--mint))" }} />
              </div>
            </div>
          ))}
        </div>
        <InfoBanner icon="★" tone="germany" style={{ marginTop: 12 }}>
          <strong>Kader-Marktwert</strong> ≈ {dt.markt} Mio €. Schlüsselspieler: Florian Wirtz, Jamal Musiala, Kai Havertz, Joshua Kimmich (C), Antonio Rüdiger.
        </InfoBanner>
      </Card>
    </section>
  );
}
