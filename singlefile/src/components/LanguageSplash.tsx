import { useStore } from "@/store";
import { LOCALES, LOCALE_LABEL, LOCALE_FLAG } from "@/i18n";

/**
 * Vollbild-Splash zur initialen Sprachauswahl. Wird in App.tsx vor
 * dem Phone-Frame gerendert, wenn `store.locale === null`. Nach der
 * Wahl wird die Locale im localStorage gespeichert und der Splash
 * verschwindet — beim nächsten Öffnen direkter Sprung zur App.
 */
export function LanguageSplash() {
  const setLocale = useStore((s) => s.setLocale);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background:
          "radial-gradient(ellipse at top, #0d1f3a 0%, var(--bg-deep) 60%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 32,
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 28,
          background: "linear-gradient(135deg, var(--mint), var(--mint-dark))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          boxShadow: "0 20px 60px rgba(94, 234, 212, 0.35)",
        }}
      >
        ⚽
      </div>

      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          TIPS-26™
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--text-tertiary)",
            fontWeight: 600,
          }}
        >
          WM 2026 · World Cup 2026
        </div>
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "var(--text-secondary)",
          textAlign: "center",
        }}
      >
        Choose your language
        <div
          style={{
            fontSize: 12,
            color: "var(--text-tertiary)",
            fontWeight: 500,
            marginTop: 4,
          }}
        >
          Sprache wählen
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          width: "100%",
          maxWidth: 360,
          flexDirection: "column",
        }}
      >
        {LOCALES.map((l) => (
          <button
            key={l}
            onClick={() => setLocale(l)}
            style={{
              padding: "16px 20px",
              borderRadius: 16,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              background:
                l === "en"
                  ? "linear-gradient(135deg, var(--mint), var(--mint-dark))"
                  : "var(--bg-secondary)",
              color: l === "en" ? "var(--bg-deep)" : "var(--text-primary)",
              border:
                l === "en"
                  ? "none"
                  : "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              boxShadow: l === "en" ? "var(--shadow-mint)" : "none",
            }}
          >
            <span style={{ fontSize: 24 }}>{LOCALE_FLAG[l]}</span>
            <span>{LOCALE_LABEL[l]}</span>
          </button>
        ))}
      </div>

      <div
        style={{
          fontSize: 11,
          color: "var(--text-tertiary)",
          textAlign: "center",
          maxWidth: 320,
        }}
      >
        You can change the language anytime in the Setup tab.
      </div>
    </div>
  );
}
