import { useState, type CSSProperties, type ReactNode } from "react";
import { useStore } from "@/store";
import type { AlgorithmVersion } from "@lib/types/simulation";
import { useT } from "@/i18n";

export function SectionTitle({ children }: { children: ReactNode }) {
  return <div className="section-title">{children}</div>;
}

/**
 * Custom Hook für ein (i)-Toggle: liefert `button` (inline platzierbar,
 * z. B. in einem horizontalen Header-Flex) und `panel` (block, separat
 * darunter zu rendern). State lebt im Hook, damit der Aufrufer nichts
 * verwalten muss.
 *
 * Warum getrennt? Wenn Button und Panel in derselben Flex-Row stehen,
 * sprengt das Panel das Layout. Aufrufer entscheidet selbst, wo das
 * Panel hin soll.
 */
export function useInfoToggle({
  children,
  size = 22,
}: {
  children: ReactNode;
  size?: number;
}) {
  const [open, setOpen] = useState(false);
  const button = (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-label="Erklärung anzeigen"
      title={open ? "Schließen" : "Erklärung anzeigen"}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        border: open ? "1px solid var(--mint)" : "1px solid var(--border-subtle)",
        background: open ? "var(--mint)" : "var(--bg-tertiary)",
        color: open ? "var(--bg-deep)" : "var(--text-tertiary)",
        fontSize: 11,
        fontWeight: 800,
        fontStyle: "italic",
        fontFamily: "Georgia, serif",
        cursor: "pointer",
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        lineHeight: 1,
        transition: "all 0.15s ease",
      }}
    >
      i
    </button>
  );
  const panel = open ? (
    <div
      style={{
        marginTop: 10,
        padding: "10px 12px",
        borderRadius: 10,
        background: "rgba(94, 234, 212, 0.06)",
        border: "1px solid rgba(94, 234, 212, 0.18)",
        fontSize: 11,
        lineHeight: 1.6,
        color: "var(--text-secondary)",
      }}
    >
      {children}
    </div>
  ) : null;
  return { button, panel, open };
}

/**
 * Bequemes Wrapper-Component für simple, vertikale Layouts:
 * rendert Button und Panel direkt untereinander.
 */
export function InfoToggle({
  children,
  size,
}: {
  children: ReactNode;
  size?: number;
}) {
  const { button, panel } = useInfoToggle({ children, size });
  return (
    <>
      {button}
      {panel}
    </>
  );
}

export function Card({
  children,
  highlight,
  style,
}: { children: ReactNode; highlight?: boolean; style?: CSSProperties }) {
  return (
    <div className={`card ${highlight ? "highlight" : ""}`} style={style}>
      {children}
    </div>
  );
}

export function InfoBanner({
  icon = "i",
  tone = "info",
  children,
  style,
}: {
  icon?: string;
  tone?: "info" | "warning" | "germany";
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className={`info-banner ${tone === "info" ? "" : tone}`} style={style}>
      <div className="info-banner-icon">{icon}</div>
      <div className="info-banner-text">{children}</div>
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "secondary",
  active,
  full,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "secondary" | "primary";
  active?: boolean;
  full?: boolean;
  disabled?: boolean;
}) {
  const cls = ["btn", variant, active ? "active" : "", full ? "full" : ""].join(" ");
  return (
    <button className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function AlgorithmBadge({ algorithm }: { algorithm: AlgorithmVersion }) {
  const dfbCheat = useStore((s) => s.dfbAlwaysWins);
  const { t } = useT();
  const isAdvanced =
    algorithm === "v2" || algorithm === "v3" || algorithm === "v4" || algorithm === "v5";
  const label =
    algorithm === "v5" ? `${t.algoInfo.v5Title} ${t.algoInfo.v5Tag}`
    : algorithm === "v4" ? `${t.algoInfo.v4Title} ${t.algoInfo.v4Tag}`
    : algorithm === "v3" ? `${t.algoInfo.v3Title} ${t.algoInfo.v3Tag}`
    : algorithm === "v2" ? `${t.algoInfo.v2Title} ${t.algoInfo.v2Tag}`
    : `${t.algoInfo.v1Title} ${t.algoInfo.v1Tag}`;
  const icon =
    algorithm === "v5" ? "🎲"
    : algorithm === "v4" ? "🎯"
    : algorithm === "v3" ? "🧬"
    : algorithm === "v2" ? "⚡"
    : "🧮";
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
      <div className={`algo-badge ${isAdvanced ? "advanced" : ""}`} style={{ marginBottom: 0 }}>
        <span>{icon}</span>
        <span>{t.algoInfo.badgeCalculated} <strong>{label}</strong></span>
      </div>
      {dfbCheat && (
        <div
          className="algo-badge"
          style={{
            marginBottom: 0,
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.5)",
            color: "#fca5a5",
            boxShadow: "0 0 8px rgba(239,68,68,0.3)",
          }}
        >
          <span>{t.algoInfo.cheatBadge}</span>
        </div>
      )}
    </div>
  );
}

export function EmptyResult({ nav }: { nav: (t: any) => void }) {
  const { t } = useT();
  return (
    <InfoBanner icon="!">
      <strong>{t.groups.emptyTitle}</strong> {t.groups.emptyMid}{" "}
      <span
        style={{ color: "var(--mint)", textDecoration: "underline", cursor: "pointer", fontWeight: 700 }}
        onClick={() => nav("setup")}
      >
        {t.groups.emptyLeadGoToSetup}
      </span>{" "}
      {t.groups.emptyTail}
    </InfoBanner>
  );
}

export function formatSimCount(n: number): string {
  if (n >= 1_000_000) return `${n / 1_000_000} Mio`;
  if (n >= 1000) return `${n / 1000} K`;
  return String(n);
}

export function signed(v: number, d = 1): string {
  return `${v > 0 ? "+" : ""}${v.toFixed(d)}`;
}
