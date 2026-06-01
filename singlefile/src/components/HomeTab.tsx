import type { Tab } from "@/App";
import { TEAMS } from "@lib/data/teams";
import type { GroupName } from "@lib/types/team";
import { Card, InfoBanner, SectionTitle } from "./ui";

export function HomeTab({ nav }: { nav: (t: Tab) => void }) {
  const groups: Record<GroupName, typeof TEAMS> = {} as any;
  TEAMS.forEach((t) => {
    if (!groups[t.group]) groups[t.group] = [];
    groups[t.group].push(t);
  });

  return (
    <section>
      <div
        style={{
          padding: 16, borderRadius: 16, marginBottom: 12,
          background: "linear-gradient(135deg, #142941 0%, #1a3258 60%, #142941 100%)",
          border: "1px solid var(--border-mid)",
        }}
      >
        <div style={{
          display: "inline-block", fontSize: 10, fontWeight: 700,
          padding: "4px 8px", borderRadius: 999, marginBottom: 12,
          background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)",
          color: "#fca5a5",
        }}>🇩🇪 GRUPPE E</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          Deutschland startet am<br /><span style={{ color: "var(--mint)" }}>14. Juni 2026</span>
        </h2>
        <div style={{ fontSize: 12, marginTop: 8, color: "var(--text-secondary)" }}>
          vs. 🇨🇼 Curaçao · 19:00 MESZ · NRG Stadium, Houston
        </div>
      </div>

      <SectionTitle>📊 Tournament Stats</SectionTitle>
      <div className="stat-grid three">
        <div className="stat-card">
          <div className="stat-card-label">Teams</div>
          <div className="stat-card-value mint" style={{ fontSize: 22 }}>48</div>
          <div className="stat-card-detail">in 12 Gruppen</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Spiele</div>
          <div className="stat-card-value mint" style={{ fontSize: 22 }}>104</div>
          <div className="stat-card-detail">in 39 Tagen</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Stadien</div>
          <div className="stat-card-value mint" style={{ fontSize: 22 }}>16</div>
          <div className="stat-card-detail">3 Länder</div>
        </div>
      </div>

      <SectionTitle>📅 Wichtige Termine</SectionTitle>
      <Card>
        <div style={{ display: "grid", gap: 8, fontSize: 12 }}>
          {[
            { l: "Eröffnung", v: "11. Juni 2026" },
            { l: "Gruppenphase", v: "11.–27. Juni" },
            { l: "K.o.-Phase", v: "28. Juni – 18. Juli" },
          ].map((r) => (
            <div key={r.l} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{r.l}</span>
              <span style={{ fontWeight: 700 }}>{r.v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, background: "var(--mint-soft)", border: "1px solid var(--mint)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--mint)" }}>🏆 Das Finale</div>
          <div style={{ fontSize: 13, fontWeight: 800, marginTop: 2 }}>So, 19.07.2026 · 21:00 MESZ</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>MetLife Stadium · East Rutherford, NJ</div>
        </div>
      </Card>

      <SectionTitle>🌐 Alle 12 Gruppen</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {(Object.keys(groups) as GroupName[]).map((g) => (
          <div key={g} className={`group-card ${g === "E" ? "germany-group" : ""}`}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div className="group-letter" style={{ width: 24, height: 24, fontSize: 11 }}>{g}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {groups[g].map((t) => (
                <div
                  key={t.name}
                  style={{
                    fontSize: 11,
                    color: t.name === "Deutschland" ? "#fca5a5" : "var(--text-secondary)",
                    fontWeight: t.name === "Deutschland" ? 700 : 500,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}
                >
                  {t.flag} {t.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>🔬 Das TIPS-26-Modell</SectionTitle>
      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Thomas-Irawan Predictive Stochastics</h3>
        <p style={{ fontSize: 11, lineHeight: 1.5, color: "var(--text-secondary)" }}>
          5 wählbare Modell-Varianten (v1 Classic → v5 Bivariate), Monte-Carlo bis 1 Mio Sims, FIFA-konformes K.o.-Bracket, Player-Level-Aggregates, Markt-Edge gegen Buchmacher-Konsens.
        </p>
        <p style={{ fontSize: 10, marginTop: 8, color: "var(--text-tertiary)" }}>
          © Thomas-Irawan Method · TIPS-26™ Single-File v1.0
        </p>
      </Card>

      <InfoBanner icon="i" style={{ marginTop: 12 }}>
        <strong>Schnellstart:</strong> Wechsle zu{" "}
        <span
          style={{ color: "var(--mint)", textDecoration: "underline", fontWeight: 700, cursor: "pointer" }}
          onClick={() => nav("setup")}
        >
          Setup
        </span>, starte die Simulation, und schau Dir Gruppen, Spiele oder Ranking an.
      </InfoBanner>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <span
          style={{ fontSize: 12, fontWeight: 700, color: "var(--mint)", textDecoration: "underline", cursor: "pointer" }}
          onClick={() => nav("backtest")}
        >
          🔬 Backtest gegen WMs 2014 / 2018 / 2022 →
        </span>
      </div>
    </section>
  );
}
