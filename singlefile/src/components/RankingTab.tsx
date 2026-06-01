import type { Tab } from "@/App";
import { useStore } from "@/store";
import { TEAMS } from "@lib/data/teams";
import { AlgorithmBadge, EmptyResult, InfoBanner, SectionTitle, formatSimCount } from "./ui";

export function RankingTab({ nav }: { nav: (t: Tab) => void }) {
  const result = useStore((s) => s.simulationResult);
  if (!result) return <EmptyResult nav={nav} />;

  const N = result.numSimulations;
  const list = TEAMS.map((t, i) => ({
    name: t.name,
    flag: t.flag,
    group: t.group,
    staerke: result.staerken[i],
    titelP: (result.stats[i].titel / N) * 100,
    finaleP: (result.stats[i].finale / N) * 100,
    hfP: (result.stats[i].hf / N) * 100,
    vfP: (result.stats[i].vf / N) * 100,
  })).sort((a, b) => b.titelP - a.titelP);

  const maxP = list[0].titelP || 1;
  const top4 = list.slice(0, 4);
  const dt = list.find((t) => t.name === "Deutschland")!;
  const dtRang = list.findIndex((t) => t.name === "Deutschland") + 1;

  return (
    <section>
      <AlgorithmBadge algorithm={result.algorithm} />

      <SectionTitle>🏆 Top 4 Favoriten</SectionTitle>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-label">🥇 Top-Favorit</div>
          <div className="stat-card-value mint">{top4[0].flag} {top4[0].name}</div>
          <div className="stat-card-detail">{top4[0].titelP.toFixed(1)}% Titelchance</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">🥈 Platz 2</div>
          <div className="stat-card-value">{top4[1].flag} {top4[1].name}</div>
          <div className="stat-card-detail">{top4[1].titelP.toFixed(1)}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">🥉 Platz 3</div>
          <div className="stat-card-value">{top4[2].flag} {top4[2].name}</div>
          <div className="stat-card-detail">{top4[2].titelP.toFixed(1)}%</div>
        </div>
        <div className="stat-card" style={{ borderColor: "rgba(239,68,68,0.3)" }}>
          <div className="stat-card-label" style={{ color: "#fca5a5" }}>🇩🇪 Deutschland</div>
          <div className="stat-card-value">Rang {dtRang}</div>
          <div className="stat-card-detail">{dt.titelP.toFixed(1)}% · HF {dt.hfP.toFixed(0)}%</div>
        </div>
      </div>

      <SectionTitle>📋 Alle 48 Teams</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {list.map((t, i) => {
          const w = (t.titelP / maxP) * 100;
          const posClass = i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "";
          return (
            <div
              key={t.name}
              className={`rank-item ${t.name === "Deutschland" ? "is-germany" : ""}`}
            >
              <div className={`rank-position ${posClass}`}>{i + 1}</div>
              <div className="rank-flag">{t.flag}</div>
              <div className="rank-info">
                <div className="rank-name">{t.name}</div>
                <div className="rank-meta">Gruppe {t.group} · Stärke {(t.staerke * 100).toFixed(0)}</div>
              </div>
              <div className="rank-prob">
                <div className="rank-prob-value">{t.titelP.toFixed(1)}%</div>
                <div className="rank-prob-bar">
                  <div className="rank-prob-bar-fill" style={{ width: `${Math.max(2, w)}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <InfoBanner icon="✓" style={{ marginTop: 16 }}>
        Ergebnis aus <strong>{formatSimCount(N)}</strong> Turnier-Simulationen.
      </InfoBanner>
    </section>
  );
}
