import type { CSSProperties, ReactNode } from "react";

export function Card({
  children,
  className,
  style,
  highlight = false,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${className ?? ""}`}
      style={{
        background: "var(--bg-card)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: highlight
          ? "1px solid var(--border-mid)"
          : "1px solid var(--border-subtle)",
        boxShadow: highlight ? "var(--shadow-mint)" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div
      className="text-[11px] uppercase tracking-[1.5px] font-bold mt-5 mb-2.5 mx-1"
      style={{ color: "var(--mint)" }}
    >
      {children}
    </div>
  );
}
