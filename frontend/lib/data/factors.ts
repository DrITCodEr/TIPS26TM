import type { FactorDefinition } from "@/lib/types/factors";

/** Definition aller 9 Gewichtungsfaktoren (Reihenfolge = Slider-Reihenfolge im UI). */
export const FAKTOREN: FactorDefinition[] = [
  { key: "elo", label: "ELO-Rating", icon: "📊", default: 30, max: 50 },
  { key: "fifa", label: "FIFA-Punkte", icon: "🏅", default: 10, max: 30 },
  { key: "markt", label: "Marktwert", icon: "💰", default: 15, max: 30 },
  { key: "form", label: "Aktuelle Form", icon: "🔥", default: 15, max: 30 },
  { key: "heim", label: "Heimvorteil", icon: "🏠", default: 7, max: 25 },
  { key: "wmHF", label: "WM-Erfahrung", icon: "🏛️", default: 5, max: 20 },
  { key: "trainer", label: "Trainer-Stärke", icon: "👔", default: 4, max: 15 },
  { key: "star", label: "Top-Star-Wert", icon: "⭐", default: 9, max: 25 },
  { key: "hoehe", label: "Klima-Anpassung", icon: "🌡️", default: 5, max: 15 },
];
