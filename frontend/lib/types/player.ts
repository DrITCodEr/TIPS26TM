/**
 * Aggregierte Player-Level-Features pro Team (Spec §9.2).
 *
 * Demo-Daten — präzise Werte erfordern fbref.com / transfermarkt-Scraping.
 * Schema folgt Stübinger et al. (2020) plus deutsche Marktwert-Konvention.
 */
export interface PlayerAggregates {
  /** Marktwert der besten 11 Spieler im Kader, in Mio. EUR */
  top11Markt: number;

  /** Anteil der 23er-Kader-Spieler in Top-5-Ligen (EPL/LaLiga/Bundesliga/SerieA/Ligue1), 0..1 */
  pctTop5Ligen: number;

  /** Anzahl Spieler im Kader, die regelmäßig in der UCL aktiv sind (0..15) */
  uclSpieler: number;

  /**
   * Erwartete Tore (xG) der Offensive (Stürmer + offensive Mittelfeldspieler)
   * pro Spiel über die letzten 12 Monate. Range ≈ 0.5..2.5.
   */
  xgAttacke: number;

  /**
   * Erwartete Gegentore (xGA) der Defensive über die letzten 12 Monate.
   * Range ≈ 0.5..2.0. Niedriger = besser.
   */
  xgaDefense: number;

  /**
   * Goalkeeper Post-Shot xG Save % über die letzten 12 Monate.
   * Range ≈ 0.60..0.80. Höher = besser.
   */
  gkPsxg: number;
}
