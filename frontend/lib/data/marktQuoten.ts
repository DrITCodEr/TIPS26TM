import type { MarktQuoten, OddsMeta } from "@/lib/types/odds";
import { TEAMS } from "./teams";

/**
 * Aggregierter Buchmacher-Konsens für den Outright-Sieger der WM 2026.
 *
 * Stand: 13. Mai 2026 · Quellen: BetMGM, DraftKings, FanDuel, Pinnacle.
 * Format: decimal odds (American → Decimal: positive +X = X/100 + 1).
 * Gesamt-Overround ≈ 1.16 (typisch für Outright-Märkte).
 */
export const MARKT_QUOTEN: MarktQuoten = {
  Spanien: 5.5,
  Frankreich: 6.0,
  England: 7.5,
  Brasilien: 9.0,
  Argentinien: 10.0,
  Deutschland: 15.0,
  Portugal: 16.0,
  Niederlande: 21.0,
  Belgien: 31.0,
  Kroatien: 36.0,
  Marokko: 41.0,
  Kolumbien: 41.0,
  Uruguay: 51.0,
  USA: 51.0,
  Norwegen: 66.0,
  Senegal: 66.0,
  Mexiko: 81.0,
  Japan: 81.0,
  Türkei: 101.0,
  Schweiz: 101.0,
  Ecuador: 126.0,
  Österreich: 151.0,
  Kanada: 151.0,
  Schottland: 151.0,
  Schweden: 201.0,
  "Elfenbeink.": 251.0,
  Südkorea: 301.0,
  Ägypten: 301.0,
  Iran: 301.0,
  Tschechien: 401.0,
  Algerien: 401.0,
  Tunesien: 501.0,
  Australien: 501.0,
  Paraguay: 501.0,
  Ghana: 501.0,
  Panama: 751.0,
  Usbekistan: 751.0,
  "DR Kongo": 751.0,
  Bosnien: 1001.0,
  "Saudi-Arabien": 1001.0,
  "Kap Verde": 1501.0,
  Südafrika: 1501.0,
  Neuseeland: 1501.0,
  Irak: 1501.0,
  Jordanien: 2001.0,
  Haiti: 2001.0,
  Katar: 2001.0,
  Curaçao: 5001.0,
};

/** Vig-bereinigender Nenner: Σ 1/odds_i über alle Teams. */
export const MARKT_MARGIN: number = TEAMS.reduce(
  (sum, t) => sum + 1 / (MARKT_QUOTEN[t.name] ?? 9999),
  0,
);

export const ODDS_META: OddsMeta = {
  stand: "13. Mai 2026",
  quellen: ["BetMGM", "DraftKings", "FanDuel", "Pinnacle"],
};
