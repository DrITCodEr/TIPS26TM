import type { ReactNode } from "react";

type Phase = 1 | 2 | 3 | 4 | 5;

const PHASE_LABEL: Record<Phase, string> = {
  1: "Phase 1 · Skelett",
  2: "Phase 2 · Algorithmen + Daten",
  3: "Phase 3 · UI-Implementierung",
  4: "Phase 4 · Polish",
  5: "Phase 5 · Web Worker + Deploy",
};

export function StubPage({
  title,
  emoji,
  phase,
  children,
}: {
  title: string;
  emoji: string;
  phase: Phase;
  children?: ReactNode;
}) {
  return (
    <section>
      <div
        className="rounded-2xl p-5 mb-4"
        style={{
          background: "var(--bg-card)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{emoji}</span>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        </div>
        <div
          className="text-xs uppercase tracking-[1.5px] font-bold mb-3"
          style={{ color: "var(--mint)" }}
        >
          Wird in {PHASE_LABEL[phase]} implementiert
        </div>
        <div
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {children ?? "Stub. Inhalt folgt in den nächsten Phasen."}
        </div>
      </div>
    </section>
  );
}
