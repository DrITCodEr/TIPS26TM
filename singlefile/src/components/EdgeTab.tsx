import { useMemo } from "react";
import type { Tab } from "@/App";
import { useStore } from "@/store";
import { TEAMS } from "@lib/data/teams";
import { SCHEDULE } from "@lib/data/schedule";
import { MARKT_QUOTEN, ODDS_META } from "@lib/data/marktQuoten";
import {
  calculateMatchEdges,
  calculateTitelEdge,
} from "@lib/algorithms/edgeAnalysis";
import { AlgorithmBadge, EmptyResult, InfoBanner, SectionTitle, signed } from "./ui";

function pillClass(edge: number, threshold = 0.5) {
  if (Math.abs(edge) < threshold) return "neutral";
  return edge > 0 ? "positive" : "negative";
}

export function EdgeTab({ nav }: { nav: (t: Tab) => void }) {
  const result = useStore((s) => s.simulationResult);

  const titelEdges = useMemo(
    () => (result ? calculateTitelEdge(result, TEAMS, MARKT_QUOTEN).slice(0, 20) : []),
    [result],
  );
  const matchEdges = useMemo(
    () => (result
      ? calculateMatchEdges(result, TEAMS, SCHEDULE, MARKT_QUOTEN)
          .sort((a, b) => b.maxAbsEdge - a.maxAbsEdge)
          .slice(0, 15)
      : []),
    [result],
  );

  if (!result) return <EmptyResult nav={nav} />;
  const titelMax = Math.max(1, ...titelEdges.map((t) => Math.max(t.simP, t.marktP)));

  return (
    <section>
      <AlgorithmBadge algorithm={result.algorithm} />
      <InfoBanner icon="📈">
        <strong>Value-Bet-Analyse:</strong> Wo weicht TIPS-26 vom Buchmacher-Konsens ab? Positiver Edge = Modell sieht mehr Chance als der Markt.
      </InfoBanner>

      <SectionTitle>🏆 Titel-Edge (echte Markt-Daten)</SectionTitle>
      <div style={{ fontSize: 10, marginBottom: 8, padding: "0 4px", color: "var(--text-tertiary)" }}>
        Markt-Quoten Stand <strong style={{ color: "var(--text-secondary)" }}>{ODDS_META.stand}</strong> · {ODDS_META.quellen.join(", ")}. Bookmaker-Margin entzerrt.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {titelEdges.map((t) => {
          const simW = Math.max(1, (t.simP / titelMax) * 100);
          const marktW = Math.max(1, (t.marktP / titelMax) * 100);
          return (
            <div key={t.teamIdx} className={`edge-card ${t.name === "Deutschland" ? "is-germany" : ""}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{t.flag}</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{t.name}</span>
                </div>
                <span className={`edge-pill ${pillClass(t.edge, 0.5)}`}>{signed(t.edge)} pp</span>
              </div>
              <div style={{ display: "grid", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 9, width: 36, fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)" }}>Markt</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--bg-tertiary)", overflow: "hidden" }}>
                    <div style={{ width: `${marktW}%`, height: "100%", background: "rgba(148,163,184,0.6)" }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, width: 40, textAlign: "right", color: "var(--text-secondary)" }}>{t.marktP.toFixed(1)}%</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 9, width: 36, fontWeight: 700, textTransform: "uppercase", color: "var(--mint)" }}>Sim</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--bg-tertiary)", overflow: "hidden" }}>
                    <div style={{ width: `${simW}%`, height: "100%", background: "var(--mint)" }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, width: 40, textAlign: "right", color: "var(--mint)" }}>{t.simP.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <SectionTitle>⚽ Match-Edge (markt-konsistent abgeleitet)</SectionTitle>
      <InfoBanner icon="ⓘ">
        Buchmacher öffnen Match-Märkte erst kurz vor Anpfiff. Hier aus Outright-Quoten + Poisson-Modell <strong>markt-konsistent abgeleitet</strong>. Top 15 mit größter Abweichung:
      </InfoBanner>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {matchEdges.map((e) => {
          const idxA = TEAMS.findIndex((t) => t.name === e.teamA);
          const idxB = TEAMS.findIndex((t) => t.name === e.teamB);
          const isG = e.teamA === "Deutschland" || e.teamB === "Deutschland";
          const row = (label: string, market: number, sim: number, edge: number) => (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontVariantNumeric: "tabular-nums" }}>
              <span style={{ width: 16, fontWeight: 800, color: "var(--mint)" }}>{label}</span>
              <span style={{ flex: 1, color: "var(--text-tertiary)" }}>M: <strong style={{ color: "var(--text-secondary)" }}>{market.toFixed(0)}%</strong></span>
              <span style={{ flex: 1, color: "var(--text-tertiary)" }}>S: <strong style={{ color: "var(--mint)" }}>{sim.toFixed(0)}%</strong></span>
              <span className={`edge-pill ${pillClass(edge, 2)}`} style={{ width: 50, textAlign: "center" }}>{signed(edge)}</span>
            </div>
          );
          return (
            <div key={e.matchIdx} className={`match-card ${isG ? "is-germany" : ""}`}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {TEAMS[idxA].flag} {e.teamA} <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>vs</span> {TEAMS[idxB].flag} {e.teamB}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-tertiary)", flexShrink: 0, marginLeft: 8 }}>{e.date.split(",")[0]} · {e.time}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {row("1", e.marketWinA, e.simWinA, e.edgeWinA)}
                {row("X", e.marketDraw, e.simDraw, e.edgeDraw)}
                {row("2", e.marketWinB, e.simWinB, e.edgeWinB)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
