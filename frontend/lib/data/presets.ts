import type { FactorWeights } from "@/lib/types/factors";

export type PresetKey =
  | "default"
  | "balanced"
  | "elo"
  | "market"
  | "form"
  | "experience";

export const PRESETS: Record<PresetKey, FactorWeights> = {
  default: { elo: 30, fifa: 10, markt: 15, form: 15, heim: 7, wmHF: 5, trainer: 4, star: 9, hoehe: 5 },
  balanced: { elo: 12, fifa: 12, markt: 12, form: 12, heim: 11, wmHF: 11, trainer: 11, star: 11, hoehe: 8 },
  elo: { elo: 50, fifa: 10, markt: 10, form: 10, heim: 5, wmHF: 5, trainer: 5, star: 5, hoehe: 0 },
  market: { elo: 10, fifa: 5, markt: 30, form: 10, heim: 5, wmHF: 5, trainer: 5, star: 25, hoehe: 5 },
  form: { elo: 15, fifa: 5, markt: 10, form: 30, heim: 5, wmHF: 5, trainer: 5, star: 5, hoehe: 0 },
  experience: { elo: 15, fifa: 10, markt: 10, form: 10, heim: 5, wmHF: 20, trainer: 15, star: 5, hoehe: 0 },
};

export const PRESET_LABELS: Record<PresetKey, string> = {
  default: "⭐ Empfehlung",
  balanced: "⚖️ Ausgewogen",
  elo: "📈 ELO-Fokus",
  market: "💰 Marktwert",
  form: "🔥 Form",
  experience: "🏛️ Erfahrung",
};
