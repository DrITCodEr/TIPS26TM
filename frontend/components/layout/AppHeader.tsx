export function AppHeader() {
  return (
    <div className="px-6 pt-4 pb-4 relative z-[5] shrink-0">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 flex items-center justify-center text-[18px]"
            style={{
              borderRadius: 11,
              background: "linear-gradient(135deg, var(--mint), var(--mint-dark))",
              boxShadow: "var(--shadow-mint)",
            }}
          >
            ⚽
          </div>
          <div>
            <div
              className="text-[13px] font-bold uppercase tracking-[0.5px]"
              style={{ color: "var(--mint)" }}
            >
              TIPS-26™
            </div>
            <div
              className="text-[11px] mt-0.5"
              style={{ color: "var(--text-tertiary)" }}
            >
              STOCHASTIC ENGINE
            </div>
          </div>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{
              background: "var(--mint)",
              boxShadow: "0 0 8px var(--mint)",
            }}
          />
          v3.0
        </div>
      </div>
      <h1
        className="text-[28px] font-extrabold leading-[1.1]"
        style={{ letterSpacing: "-0.03em" }}
      >
        TIPS<span style={{ color: "var(--mint)" }}>-26™</span>
      </h1>
      <div
        className="text-[13px] mt-1 font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        Thomas-Irawan Predictive Stochastics
        <br />
        Bayesian Monte-Carlo · 9-Faktoren Ensemble
      </div>
    </div>
  );
}
