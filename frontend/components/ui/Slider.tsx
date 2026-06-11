"use client";

import type { CSSProperties } from "react";

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  icon,
  valueLabel,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (next: number) => void;
  label?: string;
  icon?: string;
  valueLabel?: string;
}) {
  const fillPercent = ((value - min) / (max - min)) * 100;

  return (
    <div
      className="rounded-2xl p-3.5"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {label !== undefined && (
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5 text-[13px] font-bold">
            {icon ? <span className="text-[15px]">{icon}</span> : null}
            <span>{label}</span>
          </div>
          <div
            className="px-2.5 py-1 rounded-xl text-[12px] font-extrabold tabular-nums"
            style={{ background: "var(--mint)", color: "var(--bg-deep)" }}
          >
            {valueLabel ?? value}
          </div>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="tips-range w-full"
        style={{ "--val": `${fillPercent}%` } as CSSProperties}
      />
    </div>
  );
}
