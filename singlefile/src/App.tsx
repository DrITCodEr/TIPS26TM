import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store";
import { TEAMS } from "@lib/data/teams";
import { SetupTab } from "@/components/SetupTab";
import { RankingTab } from "@/components/RankingTab";
import { GroupsTab } from "@/components/GroupsTab";
import { MatchesTab } from "@/components/MatchesTab";
import { EdgeTab } from "@/components/EdgeTab";
import { SensitivityTab } from "@/components/SensitivityTab";
import { GermanyTab } from "@/components/GermanyTab";
import { HomeTab } from "@/components/HomeTab";
import { BacktestTab } from "@/components/BacktestTab";

export type Tab =
  | "home"
  | "setup"
  | "groups"
  | "matches"
  | "ranking"
  | "sensitivity"
  | "edge"
  | "germany"
  | "backtest";

const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Home", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 3l9 9" /><path d="M5 10v10h14V10" /></svg>
  )},
  { id: "setup", label: "Setup", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="14" y2="6" /><circle cx="18" cy="6" r="2" /><line x1="4" y1="12" x2="8" y2="12" /><circle cx="12" cy="12" r="2" /><line x1="16" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="14" y2="18" /><circle cx="18" cy="18" r="2" /></svg>
  )},
  { id: "groups", label: "Gruppen", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  )},
  { id: "matches", label: "Spiele", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" /></svg>
  )},
  { id: "ranking", label: "Ranking", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V3h12v6" /><path d="M6 19v-7h12v7" /><path d="M12 3v18" /><path d="M3 19h18" /></svg>
  )},
  { id: "sensitivity", label: "Stabil.", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></svg>
  )},
  { id: "edge", label: "Edge", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></svg>
  )},
  { id: "germany", label: "DFB", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18" /><path d="M12 3a14 14 0 0 0 0 18" /></svg>
  )},
];

function formatTime(d: Date) {
  return `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function StatusBar() {
  const [t, setT] = useState(() => formatTime(new Date()));
  useEffect(() => {
    const id = setInterval(() => setT(formatTime(new Date())), 30_000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="status-bar">
      <span>{t}</span>
      <span className="status-icons">
        <svg viewBox="0 0 18 12" fill="white"><rect x="0" y="9" width="3" height="3" rx="0.5"/><rect x="4" y="7" width="3" height="5" rx="0.5"/><rect x="8" y="5" width="3" height="7" rx="0.5"/><rect x="12" y="3" width="3" height="9" rx="0.5"/></svg>
        <svg viewBox="0 0 24 12" fill="none" stroke="white" strokeWidth="1"><rect x="1" y="1" width="20" height="10" rx="2.5"/><rect x="3" y="3" width="16" height="6" rx="1" fill="white"/></svg>
      </span>
    </div>
  );
}

function AppHeader() {
  return (
    <div className="app-header">
      <div className="app-header-top">
        <div className="app-logo">
          <div className="app-logo-mark">⚽</div>
          <div>
            <div className="app-logo-text">TIPS-26™</div>
            <div className="app-logo-sub">STOCHASTIC ENGINE</div>
          </div>
        </div>
        <div className="profile-pill"><span className="profile-pill-dot" />v3.0</div>
      </div>
      <h1 className="app-title">TIPS<span className="mint-text">-26™</span></h1>
      <div className="app-subtitle">
        Thomas-Irawan Predictive Stochastics<br />
        Bayesian Monte-Carlo · 9-Faktoren Ensemble
      </div>
    </div>
  );
}

function LoadingOverlay() {
  const loading = useStore((s) => s.loading);
  const flagsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!loading.kind) return;
    const id = setInterval(() => {
      const flags = TEAMS.map((t) => t.flag);
      for (let i = 0; i < 5; i++) {
        const el = flagsRef.current[i];
        if (el) el.textContent = flags[Math.floor(Math.random() * flags.length)];
      }
    }, 220);
    return () => clearInterval(id);
  }, [loading.kind]);

  const active = loading.kind !== null;
  const pct = Math.min(100, loading.progress * 100);
  return (
    <div className={`loading-overlay ${active ? "active" : ""}`}>
      <div className="loading-stage">
        <div className="loading-pulse" />
        <div className="loading-pulse d1" />
        <div className="loading-pulse d2" />
        <div className="loading-ball">⚽</div>
      </div>
      <div className="loading-flags">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} ref={(el) => { flagsRef.current[i] = el; }}>
            {["🇩🇪", "🇪🇸", "🇫🇷", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "🇧🇷"][i]}
          </span>
        ))}
      </div>
      <div className="loading-phase">{loading.phase || "Initialisierung ..."}</div>
      <div className="loading-counter">{loading.counterText || `${Math.round(pct)}%`}</div>
      <div className="loading-progress">
        <div className="loading-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="loading-tagline">Monte-Carlo · 9 Faktoren · Poisson-Modell</div>
    </div>
  );
}

function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <nav className="bottom-nav">
      {NAV.map((n) => (
        <button
          key={n.id}
          className={`nav-item ${tab === n.id ? "active" : ""}`}
          onClick={() => setTab(n.id)}
        >
          {n.icon}
          <span>{n.label}</span>
          <div className="nav-dot" />
        </button>
      ))}
    </nav>
  );
}

export function App() {
  const [tab, setTab] = useState<Tab>("home");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scrolle nach oben beim Tab-Wechsel
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [tab]);

  // Bequemer Helper: andere Tabs aus den Tab-Komponenten anspringen
  const nav = setTab;

  return (
    <div className="app-frame">
      <div className="zigzag-bg" />
      <StatusBar />
      <AppHeader />
      <div className="scroll-container" ref={scrollRef}>
        {tab === "home" && <HomeTab nav={nav} />}
        {tab === "setup" && <SetupTab onSimulationDone={() => setTab("groups")} />}
        {tab === "groups" && <GroupsTab nav={nav} />}
        {tab === "matches" && <MatchesTab nav={nav} />}
        {tab === "ranking" && <RankingTab nav={nav} />}
        {tab === "sensitivity" && <SensitivityTab />}
        {tab === "edge" && <EdgeTab nav={nav} />}
        {tab === "germany" && <GermanyTab />}
        {tab === "backtest" && <BacktestTab onBack={() => setTab("home")} />}
      </div>
      <BottomNav tab={tab === "backtest" ? "home" : tab} setTab={setTab} />
      <LoadingOverlay />
    </div>
  );
}
