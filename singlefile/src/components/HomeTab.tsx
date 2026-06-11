import type { Tab } from "@/App";
import { TEAMS } from "@lib/data/teams";
import type { GroupName } from "@lib/types/team";
import { useT } from "@/i18n";
import { Card, InfoBanner, SectionTitle } from "./ui";

export function HomeTab({ nav }: { nav: (t: Tab) => void }) {
  const { t, teamName } = useT();
  const groups: Record<GroupName, typeof TEAMS> = {} as any;
  TEAMS.forEach((team) => {
    if (!groups[team.group]) groups[team.group] = [];
    groups[team.group].push(team);
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
        }}>{t.home.heroGroup}</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          {t.home.heroTitlePre}<br /><span style={{ color: "var(--mint)" }}>{t.home.heroTitleDate}</span>
        </h2>
        <div style={{ fontSize: 12, marginTop: 8, color: "var(--text-secondary)" }}>
          {t.home.heroMeta}
        </div>
      </div>

      <SectionTitle>{t.home.statsTitle}</SectionTitle>
      <div className="stat-grid three">
        <div className="stat-card">
          <div className="stat-card-label">{t.home.statTeams}</div>
          <div className="stat-card-value mint" style={{ fontSize: 22 }}>48</div>
          <div className="stat-card-detail">{t.home.statTeamsDetail}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">{t.home.statMatches}</div>
          <div className="stat-card-value mint" style={{ fontSize: 22 }}>104</div>
          <div className="stat-card-detail">{t.home.statMatchesDetail}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">{t.home.statStadiums}</div>
          <div className="stat-card-value mint" style={{ fontSize: 22 }}>16</div>
          <div className="stat-card-detail">{t.home.statStadiumsDetail}</div>
        </div>
      </div>

      <SectionTitle>{t.home.keyDates}</SectionTitle>
      <Card>
        <div style={{ display: "grid", gap: 8, fontSize: 12 }}>
          {[
            { l: t.home.opening, v: t.home.openingDate },
            { l: t.home.groupStage, v: t.home.groupStageDate },
            { l: t.home.knockoutStage, v: t.home.knockoutStageDate },
          ].map((r) => (
            <div key={r.l} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{r.l}</span>
              <span style={{ fontWeight: 700 }}>{r.v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, background: "var(--mint-soft)", border: "1px solid var(--mint)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--mint)" }}>{t.home.finalLabel}</div>
          <div style={{ fontSize: 13, fontWeight: 800, marginTop: 2 }}>{t.home.finalDate}</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{t.home.finalVenue}</div>
        </div>
      </Card>

      <SectionTitle>{t.home.allGroups}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {(Object.keys(groups) as GroupName[]).map((g) => (
          <div key={g} className={`group-card ${g === "E" ? "germany-group" : ""}`}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div className="group-letter" style={{ width: 24, height: 24, fontSize: 11 }}>{g}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {groups[g].map((team) => (
                <div
                  key={team.name}
                  style={{
                    fontSize: 11,
                    color: team.name === "Deutschland" ? "#fca5a5" : "var(--text-secondary)",
                    fontWeight: team.name === "Deutschland" ? 700 : 500,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}
                >
                  {team.flag} {teamName(team.name)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>{t.home.modelTitle}</SectionTitle>
      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{t.home.modelHeader}</h3>
        <p style={{ fontSize: 11, lineHeight: 1.5, color: "var(--text-secondary)" }}>
          {t.home.modelText}
        </p>
        <p style={{ fontSize: 10, marginTop: 8, color: "var(--text-tertiary)" }}>
          {t.home.modelCopyright}
        </p>
      </Card>

      <InfoBanner icon="i" style={{ marginTop: 12 }}>
        <strong>{t.home.quickStartLead}</strong>{" "}
        <span
          style={{ color: "var(--mint)", textDecoration: "underline", fontWeight: 700, cursor: "pointer" }}
          onClick={() => nav("setup")}
        >
          {t.home.quickStartGoToSetup}
        </span>{t.home.quickStartTail}
      </InfoBanner>

      <div style={{ marginTop: 16, textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
        <span
          style={{ fontSize: 12, fontWeight: 700, color: "var(--mint)", textDecoration: "underline", cursor: "pointer" }}
          onClick={() => nav("bracket")}
        >
          {t.home.linkBracket}
        </span>
        <span
          style={{ fontSize: 12, fontWeight: 700, color: "var(--mint)", textDecoration: "underline", cursor: "pointer" }}
          onClick={() => nav("backtest")}
        >
          {t.home.linkBacktest}
        </span>
      </div>
    </section>
  );
}
