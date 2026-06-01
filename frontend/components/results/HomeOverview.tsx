import Link from "next/link";
import { TEAMS } from "@/lib/data/teams";
import type { GroupName } from "@/lib/types/team";
import { Card, SectionTitle } from "@/components/ui/Card";
import { InfoBanner } from "@/components/ui/InfoBanner";

export function HomeOverview() {
  const groups: Record<GroupName, typeof TEAMS> = {} as Record<
    GroupName,
    typeof TEAMS
  >;
  TEAMS.forEach((t) => {
    if (!groups[t.group]) groups[t.group] = [];
    groups[t.group].push(t);
  });

  return (
    <>
      <div
        className="rounded-2xl p-4 mb-4"
        style={{
          background:
            "linear-gradient(135deg, #142941 0%, #1a3258 60%, #142941 100%)",
          border: "1px solid var(--border-mid)",
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
          🇩🇪 GRUPPE E
        </div>
        <h2
          className="text-[20px] font-extrabold leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          Deutschland startet am
          <br />
          <span style={{ color: "var(--mint)" }}>14. Juni 2026</span>
        </h2>
        <div
          className="text-[12px] mt-2"
          style={{ color: "var(--text-secondary)" }}
        >
          vs. 🇨🇼 Curaçao · 19:00 Uhr MESZ · NRG Stadium, Houston
        </div>
      </div>

      <SectionTitle>📊 Tournament Stats</SectionTitle>
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Teams", value: "48", detail: "in 12 Gruppen" },
          { label: "Spiele", value: "104", detail: "in 39 Tagen" },
          { label: "Stadien", value: "16", detail: "3 Länder" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-3"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              {s.label}
            </div>
            <div
              className="text-[22px] font-extrabold mt-1"
              style={{ color: "var(--mint)" }}
            >
              {s.value}
            </div>
            <div
              className="text-[10px]"
              style={{ color: "var(--text-tertiary)" }}
            >
              {s.detail}
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>📅 Wichtige Termine</SectionTitle>
      <Card>
        <div className="grid gap-2 text-[12px]">
          {[
            { label: "Eröffnung", value: "11. Juni 2026" },
            { label: "Gruppenphase", value: "11.–27. Juni" },
            { label: "K.o.-Phase", value: "28. Juni – 18. Juli" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center">
              <span
                className="font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                {row.label}
              </span>
              <span className="font-bold">{row.value}</span>
            </div>
          ))}
        </div>
        <div
          className="mt-3 pt-3 px-3 py-2.5 rounded-xl"
          style={{
            background: "var(--mint-soft)",
            border: "1px solid var(--mint)",
          }}
        >
          <div
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "var(--mint)" }}
          >
            🏆 Das Finale
          </div>
          <div className="text-[13px] font-extrabold mt-0.5">
            So, 19.07.2026 · 21:00 MESZ
          </div>
          <div
            className="text-[11px]"
            style={{ color: "var(--text-secondary)" }}
          >
            MetLife Stadium · East Rutherford, NJ
          </div>
        </div>
      </Card>

      <SectionTitle>🌐 Alle 12 Gruppen</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(groups).map(([g, ts]) => (
          <div
            key={g}
            className="rounded-xl p-2.5"
            style={{
              background: "var(--bg-card)",
              border:
                g === "E"
                  ? "1px solid rgba(239, 68, 68, 0.3)"
                  : "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-extrabold"
                style={{ background: "var(--mint)", color: "var(--bg-deep)" }}
              >
                {g}
              </div>
            </div>
            <div className="space-y-0.5">
              {ts.map((t) => (
                <div
                  key={t.name}
                  className="text-[11px] flex items-center gap-1 truncate"
                  style={{
                    color:
                      t.name === "Deutschland"
                        ? "#fca5a5"
                        : "var(--text-secondary)",
                    fontWeight: t.name === "Deutschland" ? 700 : 500,
                  }}
                >
                  <span>{t.flag}</span>
                  <span className="truncate">{t.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>🔬 Das TIPS-26-Modell</SectionTitle>
      <Card>
        <h3 className="text-[14px] font-bold mb-1.5">
          Thomas-Irawan Predictive Stochastics
        </h3>
        <p
          className="text-[11px] leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Das <strong>TIPS-26™</strong>-Framework kombiniert ein gewichtetes{" "}
          <strong>Multi-Faktor-Ensemble</strong> mit einem stochastischen
          Tor-Modell nach <em>Maher (1982)</em> und <em>Dixon-Coles (1997)</em>.
        </p>
        <p
          className="text-[11px] mt-2 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          <strong>① Stärke-Score:</strong> 9 Faktoren pro Team werden auf [0,1]
          normalisiert und gewichtet aggregiert.
        </p>
        <p
          className="text-[11px] mt-2 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          <strong>② Stochastisches Tor-Modell:</strong> Pro Match Tore aus einer
          Poisson-Verteilung mit λ aus dem Stärke-Differential.
        </p>
        <p
          className="text-[11px] mt-2 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          <strong>③ Monte-Carlo:</strong> Das Turnier wird tausendfach
          durchgespielt — die relative Häufigkeit konvergiert gegen die
          a-posteriori-Wahrscheinlichkeit.
        </p>
        <p
          className="text-[11px] mt-2 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          <strong>④ Sensitivitäts-Bootstrap:</strong> Gewichte werden ±15/30/50 %
          variiert, um Robustheit zu quantifizieren.
        </p>
        <p
          className="text-[10px] mt-2.5"
          style={{ color: "var(--text-tertiary)" }}
        >
          © Thomas-Irawan Method · TIPS-26™ Version 3.0.0
        </p>
      </Card>

      <InfoBanner icon="i" className="mt-3">
        <strong>Schnellstart:</strong> Wechsle zu{" "}
        <Link
          href="/setup"
          className="underline font-bold"
          style={{ color: "var(--mint)" }}
        >
          Setup
        </Link>
        , justiere die Gewichtungen, starte die Simulation und schaue Dir
        Gruppen, Spiele oder Ranking an.
      </InfoBanner>

      <div className="mt-4 text-center">
        <Link
          href="/backtest"
          className="inline-flex items-center gap-2 text-[12px] font-bold underline"
          style={{ color: "var(--mint)" }}
        >
          🔬 Backtest gegen WMs 2014 / 2018 / 2022 →
        </Link>
      </div>
    </>
  );
}
