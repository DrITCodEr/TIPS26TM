"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  active?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "secondary",
  active = false,
  fullWidth = false,
  className,
  children,
  ...rest
}: Props) {
  const isPrimary = variant === "primary";

  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center font-bold tracking-tight transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
        fullWidth ? "w-full" : ""
      } ${className ?? ""}`}
      style={{
        padding: isPrimary ? "14px 18px" : "8px 14px",
        borderRadius: isPrimary ? 16 : 999,
        fontSize: isPrimary ? 15 : 12,
        background: isPrimary
          ? "linear-gradient(135deg, var(--mint), var(--mint-dark))"
          : active
            ? "var(--mint-soft)"
            : "var(--bg-secondary)",
        color: isPrimary
          ? "var(--bg-deep)"
          : active
            ? "var(--mint)"
            : "var(--text-secondary)",
        border: isPrimary
          ? "none"
          : active
            ? "1px solid var(--mint)"
            : "1px solid var(--border-subtle)",
        boxShadow: isPrimary ? "var(--shadow-mint)" : undefined,
      }}
    >
      {children}
    </button>
  );
}
