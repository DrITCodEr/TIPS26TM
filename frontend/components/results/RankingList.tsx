"use client";

import { useSimulationStore } from "@/lib/stores/simulationStore";
import { TEAMS } from "@/lib/data/teams";
import { EmptyResult } from "./EmptyResult";
import { AlgorithmBadge } from "@/components/ui/AlgorithmBadge";
import { SectionTitle } from "@/components/ui/Card";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { formatSimCount } from "@/lib/utils/format";

interface Row {
  idx: number;
  name: string;
  flag: string;
  group: string;
  staerke: number;
  titelP: number;
  finaleP: number;
  hfP: number;
  vfP: number;
}

export function RankingList() {
  const result = useSimulationStore((s) => s.simulationResult);
  if (!result) return <EmptyResult />;

  const N = result.numSimulations;
  const liste: Row[] = TEAMS.map((t, i) => ({
    idx: i,
    name: t.name,
    flag: t.flag,
    group: t.group,
    staerke: result.staerken[i],
    titelP: (result.stats[i].titel / N) * 100,
    finaleP: (result.stats[i].finale / N) * 100,
    hfP: (result.stats[i].hf / N) * 100,
    vfP: (result.stats[i].vf / N) * 100,
  })).sort((a, b) => b.titelP - a.titelP);

  const maxP = liste[0].titelP || 1;
  const top4 = liste.slice(0, 4);
  const dt = liste.find((t) => t.name === "Deutschland")!;
  const dtRang = liste.findIndex((t) => t.name === "Deutschland") + 1;

  const statCard = (
    label: string,
    valueA: string,
    valueB: string,
    germany = false,
  ) => (
    <div
      className="rounded-2xl p-3"
      style={{
        background: "var(--bg-card)",
        border: germany
          ? "1px solid rgba(239, 68, 68, 0.3)"
          : "1px solid var(--border-subtle)",
      }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: germany ? "#fca5a5" : "var(--text-tertiary)" }}
      >
        {label}
      </div>
      <div className="text-[14px] font-extrabold mt-1 leading-tight">
        {valueA}
      </div>
      <div
        className="text-[11px] mt-0.5"
        style={{ color: "var(--text-tertiary)" }}
      >
        {valueB}
      </div>
    </div>
  );

  return (
    <>
      <AlgorithmBadge />

      <SectionTitle>🏆 Top 4 Favoriten</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        {statCard(
          "🥇 Top-Favorit",
          `${top4[0].flag} ${top4[0].name}`,
          `${top4[0].titelP.toFixed(1)}% Titelchance`,
        )}
        {statCard(
          "🥈 Platz 2",
          `${top4[1].flag} ${top4[1].name}`,
          `${top4[1].titelP.toFixed(1)}%`,
        )}
        {statCard(
          "🥉 Platz 3",
          `${top4[2].flag} ${top4[2].name}`,
          `${top4[2].titelP.toFixed(1)}%`,
        )}
        {statCard(
          "🇩🇪 Deutschland",
          `Rang ${dtRang}`,
          `${dt.titelP.toFixed(1)}% · HF ${dt.hfP.toFixed(0)}%`,
          true,
        )}
      </div>

      <SectionTitle>📋 Alle 48 Teams</SectionTitle>
      <div className="space-y-1.5">
        {liste.map((t, i) => {
          const breite = (t.titelP / maxP) * 100;
          let posStyle: React.CSSProperties = {
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          };
          if (i === 0)
            posStyle = { background: "var(--gold)", color: "#3a2606" };
          else if (i === 1)
            posStyle = { background: "var(--silver)", color: "#1a1a1a" };
          else if (i === 2)
            posStyle = { background: "var(--bronze)", color: "#fff8e7" };

          return (
            <div
              key={t.idx}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{
                background:
                  t.name === "Deutschland"
                    ? "rgba(239, 68, 68, 0.08)"
                    : "var(--bg-card)",
                border:
                  t.name === "Deutschland"
                    ? "1px solid rgba(239, 68, 68, 0.3)"
                    : "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-extrabold shrink-0"
                style={posStyle}
              >
                {i + 1}
              </div>
              <div className="text-[20px] leading-none shrink-0">{t.flag}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold truncate">{t.name}</div>
                <div
                  className="text-[10px]"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Gruppe {t.group} · Stärke {(t.staerke * 100).toFixed(0)}
                </div>
              </div>
              <div className="text-right shrink-0 w-20">
                <div
                  className="text-[14px] font-extrabold tabular-nums"
                  style={{ color: "var(--mint)" }}
                >
                  {t.titelP.toFixed(1)}%
                </div>
                <div
                  className="h-1 mt-1 rounded-full overflow-hidden"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.max(2, breite)}%`,
                      background:
                        "linear-gradient(to right, var(--mint-dark), var(--mint))",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <InfoBanner icon="✓" className="mt-4">
        Ergebnis aus <strong>{formatSimCount(N)}</strong> Turnier-Simulationen.
      </InfoBanner>
    </>
  );
}
