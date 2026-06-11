import type { CSSProperties } from "react";
import {
  selectNumSimulations,
  SIM_LEVELS,
  useStore,
} from "@/store";
import { useRunSimulation } from "@/runHooks";
import { FAKTOREN } from "@lib/data/factors";
import { PRESETS, type PresetKey } from "@lib/data/presets";
import type { AlgorithmVersion } from "@lib/types/simulation";
import { useT, LOCALES, LOCALE_FLAG, LOCALE_LABEL } from "@/i18n";
import { Button, Card, InfoBanner, SectionTitle, formatSimCount } from "./ui";

const PRESET_ORDER: PresetKey[] = ["default", "balanced", "elo", "market", "form", "experience"];

function AlgorithmSwitcher() {
  const algorithm = useStore((s) => s.algorithm);
  const setAlgorithm = useStore((s) => s.setAlgorithm);
  const { t } = useT();
  const versions: AlgorithmVersion[] = ["v1", "v2", "v3", "v4", "v5"];

  const info = (v: AlgorithmVersion) => {
    if (v === "v1") return { title: t.algoInfo.v1Title, tag: t.algoInfo.v1Tag, desc: t.algoInfo.v1Desc, details: t.algoInfo.v1Details };
    if (v === "v2") return { title: t.algoInfo.v2Title, tag: t.algoInfo.v2Tag, desc: t.algoInfo.v2Desc, details: t.algoInfo.v2Details };
    if (v === "v3") return { title: t.algoInfo.v3Title, tag: t.algoInfo.v3Tag, desc: t.algoInfo.v3Desc, details: t.algoInfo.v3Details };
    if (v === "v4") return { title: t.algoInfo.v4Title, tag: t.algoInfo.v4Tag, desc: t.algoInfo.v4Desc, details: t.algoInfo.v4Details };
    return { title: t.algoInfo.v5Title, tag: t.algoInfo.v5Tag, desc: t.algoInfo.v5Desc, details: t.algoInfo.v5Details };
  };

  return (
    <>
      <div className="algo-grid">
        {versions.map((v) => {
          const i = info(v);
          const active = algorithm === v;
          return (
            <button
              key={v}
              className={`algo-btn ${active ? "active" : ""}`}
              onClick={() => setAlgorithm(v)}
            >
              <div className="algo-btn-row">
                <span className="algo-btn-name">{i.title}</span>
                <span className="algo-btn-tag">{i.tag}</span>
              </div>
              <div className="algo-btn-desc">{i.desc}</div>
            </button>
          );
        })}
      </div>
      <div className="algo-info" dangerouslySetInnerHTML={{ __html: info(algorithm).details }} />
    </>
  );
}

function Presets() {
  const activePreset = useStore((s) => s.activePreset);
  const applyPreset = useStore((s) => s.applyPreset);
  const { t } = useT();
  return (
    <div className="preset-row">
      {PRESET_ORDER.map((p) => (
        <Button key={p} active={activePreset === p} onClick={() => applyPreset(p)}>
          {t.presets[p]}
        </Button>
      ))}
    </div>
  );
}

function FactorSliders() {
  const weights = useStore((s) => s.weights);
  const setWeight = useStore((s) => s.setWeight);
  const { t } = useT();
  return (
    <div className="sliders-wrap">
      {FAKTOREN.map((f) => {
        const pct = (weights[f.key] / f.max) * 100;
        return (
          <div className="slider-card" key={f.key}>
            <div className="slider-header">
              <div className="slider-label">
                <span className="slider-icon">{f.icon}</span>
                {t.factors[f.key]}
              </div>
              <div className="slider-value-pill">{weights[f.key]}%</div>
            </div>
            <input
              type="range"
              min={0}
              max={f.max}
              value={weights[f.key]}
              onChange={(e) => setWeight(f.key, Number(e.target.value))}
              className="tips-range"
              style={{ "--val": `${pct}%` } as CSSProperties}
            />
          </div>
        );
      })}
    </div>
  );
}

function SimDepthSlider() {
  const idx = useStore((s) => s.numSimulationsIdx);
  const setIdx = useStore((s) => s.setNumSimulationsIdx);
  const { t } = useT();
  const N = selectNumSimulations({ numSimulationsIdx: idx });
  const display = formatSimCount(N);
  const pct = (idx / (SIM_LEVELS.length - 1)) * 100;

  let warning: { tone: "warning" | "info"; text: string } | null = null;
  if (N >= 500_000) warning = { tone: "warning", text: t.setup.perfWarn500k(display, Math.round(N / 22_000)) };
  else if (N >= 100_000) warning = { tone: "warning", text: t.setup.perfWarn100k(Math.round(N / 22_000)) };
  else if (N >= 20_000) warning = { tone: "info", text: t.setup.perfInfo20k(Math.max(1, Math.round(N / 22_000))) };

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{t.setup.simDepth.title}</div>
          <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>
            {t.setup.simDepth.hint}
          </div>
        </div>
        <div className="slider-value-pill" style={{ fontSize: 14, padding: "6px 12px" }}>{display}</div>
      </div>
      <input
        type="range"
        min={0}
        max={SIM_LEVELS.length - 1}
        value={idx}
        onChange={(e) => setIdx(Number(e.target.value))}
        className="tips-range"
        style={{ "--val": `${pct}%` } as CSSProperties}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)" }}>
        <span>{t.setup.simDepth.labelLow}</span>
        <span>{t.setup.simDepth.labelMid1}</span>
        <span>{t.setup.simDepth.labelMid2}</span>
        <span>{t.setup.simDepth.labelHigh}</span>
      </div>
      {warning && (
        <div
          style={{
            marginTop: 12, fontSize: 11, padding: "8px 12px", borderRadius: 8,
            background: warning.tone === "warning" ? "rgba(249,115,22,0.12)" : "var(--bg-tertiary)",
            color: warning.tone === "warning" ? "var(--orange)" : "var(--text-secondary)",
            border: warning.tone === "warning" ? "1px solid rgba(249,115,22,0.3)" : "1px solid var(--border-subtle)",
          }}
        >
          {warning.text}
        </div>
      )}
    </Card>
  );
}

function SurpriseSlider() {
  const value = useStore((s) => s.surprisePercent);
  const setValue = useStore((s) => s.setSurprisePercent);
  const { t } = useT();
  const sigmaPercent = ((value / 100) * 0.3 * 100).toFixed(0);
  let hint = t.setup.surprise.hint0;
  if (value > 0 && value <= 20) hint = t.setup.surprise.hint1;
  else if (value <= 50) hint = t.setup.surprise.hint2;
  else if (value <= 80) hint = t.setup.surprise.hint3;
  else if (value > 80) hint = t.setup.surprise.hint4;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15 }}>🎲</span> {t.setup.surprise.title}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>
            {t.setup.surprise.hint}
          </div>
        </div>
        <div className="slider-value-pill" style={{ fontSize: 14, padding: "6px 12px" }}>{value}%</div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="tips-range"
        style={{ "--val": `${value}%` } as CSSProperties}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)" }}>
        <span>{t.setup.surprise.scaleLow}</span><span>{t.setup.surprise.scaleMid}</span><span>{t.setup.surprise.scaleHigh}</span>
      </div>
      <div style={{ marginTop: 12, fontSize: 11, lineHeight: 1.5, color: "var(--text-secondary)" }}>
        {hint}{" "}
        <span style={{ color: "var(--text-tertiary)" }}>
          {t.setup.surprise.sigmaParen(sigmaPercent)}
        </span>
      </div>
    </Card>
  );
}

function OverdispersionSlider() {
  const value = useStore((s) => s.dispersionPercent);
  const setValue = useStore((s) => s.setDispersionPercent);
  const { t } = useT();
  const phi = ((value / 100) * 1.5).toFixed(2);
  let hint = t.setup.overdisp.hint0;
  if (value > 0 && value <= 20) hint = t.setup.overdisp.hint1;
  else if (value <= 40) hint = t.setup.overdisp.hint2;
  else if (value <= 60) hint = t.setup.overdisp.hint3;
  else if (value <= 80) hint = t.setup.overdisp.hint4;
  else hint = t.setup.overdisp.hint5;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15 }}>⚡</span> {t.setup.overdisp.title}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>
            {t.setup.overdisp.hint}
          </div>
        </div>
        <div className="slider-value-pill" style={{ fontSize: 14, padding: "6px 12px" }}>{value}%</div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="tips-range"
        style={{ "--val": `${value}%` } as CSSProperties}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)" }}>
        <span>{t.setup.overdisp.scaleLow}</span><span>{t.setup.overdisp.scaleMid}</span><span>{t.setup.overdisp.scaleHigh}</span>
      </div>
      <div style={{ marginTop: 12, fontSize: 11, lineHeight: 1.5, color: "var(--text-secondary)" }}>
        {hint}{" "}
        <span style={{ color: "var(--text-tertiary)" }}>
          {t.setup.overdisp.phiParen(phi)}
        </span>
      </div>
    </Card>
  );
}

function DfbCheatToggle() {
  const active = useStore((s) => s.dfbAlwaysWins);
  const setActive = useStore((s) => s.setDfbAlwaysWins);
  const { t } = useT();
  return (
    <button
      onClick={() => setActive(!active)}
      style={{
        width: "100%",
        padding: 16,
        textAlign: "left",
        borderRadius: 16,
        cursor: "pointer",
        background: active
          ? "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(239,68,68,0.06))"
          : "var(--bg-card)",
        border: active ? "1px solid rgba(239,68,68,0.5)" : "1px solid var(--border-subtle)",
        boxShadow: active ? "0 0 16px rgba(239,68,68,0.25)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>🇩🇪</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: active ? "#fca5a5" : "var(--text-primary)" }}>
            {t.setup.dfbCheat.title}
          </span>
        </div>
        <div
          style={{
            width: 48, height: 28, borderRadius: 14, position: "relative", flexShrink: 0,
            background: active ? "var(--germany-red)" : "var(--bg-tertiary)",
            transition: "all 0.15s ease",
          }}
        >
          <div
            style={{
              position: "absolute", top: 4, width: 20, height: 20, borderRadius: 10,
              background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              left: active ? 24 : 4, transition: "left 0.15s ease",
            }}
          />
        </div>
      </div>
      <div style={{ fontSize: 11, lineHeight: 1.5, color: "var(--text-secondary)" }}>
        {active ? (
          <>
            <strong style={{ color: "#fca5a5" }}>{t.setup.dfbCheat.onLead}</strong>{" "}
            {t.setup.dfbCheat.onText}
          </>
        ) : (
          <>
            <strong>{t.setup.dfbCheat.offLead}</strong>{" "}
            {t.setup.dfbCheat.offText}
          </>
        )}
      </div>
    </button>
  );
}

function LanguageSwitcher() {
  const locale = useStore((s) => s.locale);
  const setLocale = useStore((s) => s.setLocale);
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {LOCALES.map((l) => (
        <Button key={l} active={locale === l} onClick={() => setLocale(l)}>
          {LOCALE_FLAG[l]} {LOCALE_LABEL[l]}
        </Button>
      ))}
    </div>
  );
}

export function SetupTab({ onSimulationDone }: { onSimulationDone: () => void }) {
  const idx = useStore((s) => s.numSimulationsIdx);
  const loading = useStore((s) => s.loading.kind);
  const run = useRunSimulation(onSimulationDone);
  const N = selectNumSimulations({ numSimulationsIdx: idx });
  const { t } = useT();

  return (
    <section>
      <InfoBanner icon="⚙">
        <strong>{t.setup.bannerStrong}</strong> {t.setup.banner.replace(t.setup.bannerStrong, "").trim()}
      </InfoBanner>

      <SectionTitle>{t.setup.algoTitle}</SectionTitle>
      <AlgorithmSwitcher />

      <SectionTitle>{t.setup.presetsTitle}</SectionTitle>
      <Presets />

      <SectionTitle>{t.setup.weightsTitle}</SectionTitle>
      <FactorSliders />

      <SectionTitle>{t.setup.simDepthTitle}</SectionTitle>
      <SimDepthSlider />

      <SectionTitle>{t.setup.surpriseTitle}</SectionTitle>
      <SurpriseSlider />

      <SectionTitle>{t.setup.overdispTitle}</SectionTitle>
      <OverdispersionSlider />

      <SectionTitle>{t.setup.funModeTitle}</SectionTitle>
      <DfbCheatToggle />

      <SectionTitle>{t.setup.languageTitle}</SectionTitle>
      <LanguageSwitcher />

      <div className="sim-controls">
        <Button variant="primary" full disabled={loading !== null} onClick={run}>
          {loading ? t.setup.runButtonBusy : `${t.setup.runButton} · ${formatSimCount(N)}${t.setup.runButtonTimes}`}
        </Button>
        <div className="sim-status">{t.setup.statusReady}</div>
      </div>
    </section>
  );
}
