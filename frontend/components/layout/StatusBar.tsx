"use client";

import { useEffect, useState } from "react";

function formatTime(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function StatusBar() {
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const tick = () => setTime(formatTime(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex items-center justify-between relative z-10 text-[14px] font-semibold"
      style={{
        padding: "max(env(safe-area-inset-top), 12px) 24px 6px",
      }}
    >
      <span suppressHydrationWarning>{time}</span>
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 18 12" fill="white" className="w-4 h-3">
          <rect x="0" y="9" width="3" height="3" rx="0.5" />
          <rect x="4" y="7" width="3" height="5" rx="0.5" />
          <rect x="8" y="5" width="3" height="7" rx="0.5" />
          <rect x="12" y="3" width="3" height="9" rx="0.5" />
        </svg>
        <svg viewBox="0 0 18 12" fill="white" className="w-4 h-3">
          <path d="M9 8.5c.5 0 .9-.4.9-.9 0-.5-.4-.9-.9-.9s-.9.4-.9.9c0 .5.4.9.9.9zm-2.5-2.4c.7-.7 1.6-1.1 2.5-1.1s1.8.4 2.5 1.1l.7-.7c-.9-.9-2-1.4-3.2-1.4s-2.3.5-3.2 1.4l.7.7zm-2-2c1.3-1.3 3-2 4.5-2s3.2.7 4.5 2l.7-.7c-1.4-1.4-3.3-2.2-5.2-2.2s-3.8.8-5.2 2.2l.7.7z" />
        </svg>
        <svg
          viewBox="0 0 24 12"
          fill="none"
          stroke="white"
          strokeWidth="1"
          className="w-6 h-3"
        >
          <rect x="1" y="1" width="20" height="10" rx="2.5" />
          <rect x="3" y="3" width="16" height="6" rx="1" fill="white" />
          <path d="M22 4v4" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
}
