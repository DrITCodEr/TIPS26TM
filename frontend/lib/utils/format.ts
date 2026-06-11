export function formatSimCount(n: number): string {
  if (n >= 1_000_000) return `${n / 1_000_000} Mio`;
  if (n >= 1000) return `${n / 1000} K`;
  return String(n);
}

export function pct(numerator: number, denominator: number, digits = 1): string {
  if (!denominator) return "0%";
  return `${((numerator / denominator) * 100).toFixed(digits)}%`;
}

export function signed(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}`;
}
