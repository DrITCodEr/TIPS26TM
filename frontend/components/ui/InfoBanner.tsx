import type { ReactNode } from "react";

export function InfoBanner({
  icon = "i",
  children,
  tone = "info",
  className,
}: {
  icon?: string;
  children: ReactNode;
  tone?: "info" | "warning" | "germany";
  className?: string;
}) {
  const colors: Record<
    NonNullable<typeof tone>,
    { bg: string; border: string; iconBg: string; iconColor: string }
  > = {
    info: {
      bg: "var(--mint-soft)",
      border: "var(--border-mid)",
      iconBg: "var(--mint)",
      iconColor: "var(--bg-deep)",
    },
    warning: {
      bg: "rgba(249, 115, 22, 0.1)",
      border: "rgba(249, 115, 22, 0.3)",
      iconBg: "var(--orange)",
      iconColor: "#0a1628",
    },
    germany: {
      bg: "rgba(239, 68, 68, 0.08)",
      border: "rgba(239, 68, 68, 0.3)",
      iconBg: "var(--germany-red)",
      iconColor: "#ffffff",
    },
  };
  const c = colors[tone];

  return (
    <div
      className={`flex items-start gap-3 px-3.5 py-3 my-3 rounded-2xl ${className ?? ""}`}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
      }}
    >
      <div
        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-extrabold"
        style={{ background: c.iconBg, color: c.iconColor }}
      >
        {icon}
      </div>
      <div
        className="text-[12px] leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {children}
      </div>
    </div>
  );
}
