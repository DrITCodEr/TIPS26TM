"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const ICON_PROPS = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" {...ICON_PROPS}>
        <path d="M3 12L12 3l9 9" />
        <path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    href: "/setup",
    label: "Setup",
    icon: (
      <svg viewBox="0 0 24 24" {...ICON_PROPS}>
        <line x1="4" y1="6" x2="14" y2="6" />
        <circle cx="18" cy="6" r="2" />
        <line x1="4" y1="12" x2="8" y2="12" />
        <circle cx="12" cy="12" r="2" />
        <line x1="16" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="14" y2="18" />
        <circle cx="18" cy="18" r="2" />
      </svg>
    ),
  },
  {
    href: "/groups",
    label: "Gruppen",
    icon: (
      <svg viewBox="0 0 24 24" {...ICON_PROPS}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/matches",
    label: "Spiele",
    icon: (
      <svg viewBox="0 0 24 24" {...ICON_PROPS}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
      </svg>
    ),
  },
  {
    href: "/ranking",
    label: "Ranking",
    icon: (
      <svg viewBox="0 0 24 24" {...ICON_PROPS}>
        <path d="M6 9V3h12v6" />
        <path d="M6 19v-7h12v7" />
        <path d="M12 3v18" />
        <path d="M3 19h18" />
      </svg>
    ),
  },
  {
    href: "/sensitivity",
    label: "Stabil.",
    icon: (
      <svg viewBox="0 0 24 24" {...ICON_PROPS}>
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M14 7h7v7" />
      </svg>
    ),
  },
  {
    href: "/edge",
    label: "Edge",
    icon: (
      <svg viewBox="0 0 24 24" {...ICON_PROPS}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4l3 2" />
        <path d="M6 6l-2-2" />
        <path d="M18 6l2-2" />
      </svg>
    ),
  },
  {
    href: "/germany",
    label: "DFB",
    icon: (
      <svg viewBox="0 0 24 24" {...ICON_PROPS}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a14 14 0 0 1 0 18" />
        <path d="M12 3a14 14 0 0 0 0 18" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="absolute bottom-0 left-0 right-0 flex justify-around z-20"
      style={{
        background: "rgba(10, 22, 40, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border-subtle)",
        padding: "10px 4px max(env(safe-area-inset-bottom), 12px)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 transition-colors py-1 px-1"
            style={{
              color: active ? "var(--mint)" : "var(--text-tertiary)",
              flex: "1 1 0",
              minWidth: 0,
            }}
          >
            <span className="w-5 h-5 flex items-center justify-center">
              {item.icon}
            </span>
            <span className="text-[9px] font-bold tracking-tight">
              {item.label}
            </span>
            <span
              className="w-1 h-1 rounded-full"
              style={{
                background: active ? "var(--mint)" : "transparent",
                boxShadow: active ? "0 0 6px var(--mint)" : undefined,
              }}
            />
          </Link>
        );
      })}
    </nav>
  );
}
