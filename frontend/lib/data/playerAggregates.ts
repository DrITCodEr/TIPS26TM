import type { PlayerAggregates } from "@/lib/types/player";

/**
 * Demo-Aggregate für alle 48 WM-2026-Teams.
 *
 * Werte sind approximiert nach öffentlich verfügbarem Material (Stand Mai 2026):
 *  • top11Markt: Top-11-Marktwert per transfermarkt ≈ 0.75–0.90 × Gesamtkader
 *  • pctTop5Ligen: % der nominierten Spieler in EPL/LaLiga/Bundesliga/SerieA/Ligue1
 *  • uclSpieler: Anzahl Spieler regelmäßig in der UCL aktiv (Schätzwert)
 *  • xgAttacke / xgaDefense: rolling 12-Monats-Schnitt (Schätzwert)
 *  • gkPsxg: Stamm-GK Post-Shot xG Save % (Schätzwert)
 *
 * ⚠️ Pipeline-Demonstration. Echte Werte erfordern fbref-Scraping (Roadmap §9.2).
 */
export const PLAYER_AGGREGATES: Record<string, PlayerAggregates> = {
  // Gruppe A
  Mexiko:        { top11Markt:  95, pctTop5Ligen: 0.25, uclSpieler:  1, xgAttacke: 1.3, xgaDefense: 1.2, gkPsxg: 0.68 },
  Südafrika:     { top11Markt:  22, pctTop5Ligen: 0.15, uclSpieler:  0, xgAttacke: 0.9, xgaDefense: 1.4, gkPsxg: 0.64 },
  Südkorea:      { top11Markt: 180, pctTop5Ligen: 0.40, uclSpieler:  2, xgAttacke: 1.2, xgaDefense: 1.3, gkPsxg: 0.66 },
  Tschechien:    { top11Markt: 125, pctTop5Ligen: 0.50, uclSpieler:  3, xgAttacke: 1.2, xgaDefense: 1.2, gkPsxg: 0.70 },
  // Gruppe B
  Kanada:        { top11Markt:  95, pctTop5Ligen: 0.55, uclSpieler:  3, xgAttacke: 1.3, xgaDefense: 1.3, gkPsxg: 0.68 },
  Bosnien:       { top11Markt:  52, pctTop5Ligen: 0.45, uclSpieler:  2, xgAttacke: 1.2, xgaDefense: 1.2, gkPsxg: 0.66 },
  Katar:         { top11Markt:  12, pctTop5Ligen: 0.10, uclSpieler:  0, xgAttacke: 0.8, xgaDefense: 1.4, gkPsxg: 0.64 },
  Schweiz:       { top11Markt: 240, pctTop5Ligen: 0.65, uclSpieler:  5, xgAttacke: 1.4, xgaDefense: 1.0, gkPsxg: 0.71 },
  // Gruppe C
  Brasilien:     { top11Markt: 780, pctTop5Ligen: 0.90, uclSpieler: 13, xgAttacke: 2.0, xgaDefense: 0.8, gkPsxg: 0.74 },
  Marokko:       { top11Markt: 220, pctTop5Ligen: 0.85, uclSpieler:  7, xgAttacke: 1.5, xgaDefense: 0.9, gkPsxg: 0.73 },
  Haiti:         { top11Markt:  26, pctTop5Ligen: 0.20, uclSpieler:  0, xgAttacke: 0.9, xgaDefense: 1.5, gkPsxg: 0.62 },
  Schottland:    { top11Markt: 120, pctTop5Ligen: 0.70, uclSpieler:  3, xgAttacke: 1.2, xgaDefense: 1.1, gkPsxg: 0.68 },
  // Gruppe D
  USA:           { top11Markt: 250, pctTop5Ligen: 0.65, uclSpieler:  5, xgAttacke: 1.4, xgaDefense: 1.1, gkPsxg: 0.70 },
  Paraguay:      { top11Markt:  26, pctTop5Ligen: 0.20, uclSpieler:  0, xgAttacke: 1.0, xgaDefense: 1.3, gkPsxg: 0.65 },
  Australien:    { top11Markt:  42, pctTop5Ligen: 0.35, uclSpieler:  1, xgAttacke: 1.0, xgaDefense: 1.3, gkPsxg: 0.66 },
  Türkei:        { top11Markt: 395, pctTop5Ligen: 0.55, uclSpieler:  5, xgAttacke: 1.5, xgaDefense: 1.1, gkPsxg: 0.69 },
  // Gruppe E
  Deutschland:   { top11Markt: 760, pctTop5Ligen: 1.00, uclSpieler: 14, xgAttacke: 1.9, xgaDefense: 0.9, gkPsxg: 0.74 },
  Curaçao:       { top11Markt:  28, pctTop5Ligen: 0.20, uclSpieler:  0, xgAttacke: 1.0, xgaDefense: 1.5, gkPsxg: 0.63 },
  "Elfenbeink.": { top11Markt: 130, pctTop5Ligen: 0.70, uclSpieler:  3, xgAttacke: 1.4, xgaDefense: 1.1, gkPsxg: 0.69 },
  Ecuador:       { top11Markt: 140, pctTop5Ligen: 0.55, uclSpieler:  4, xgAttacke: 1.3, xgaDefense: 1.1, gkPsxg: 0.69 },
  // Gruppe F
  Niederlande:   { top11Markt: 600, pctTop5Ligen: 0.85, uclSpieler: 11, xgAttacke: 1.8, xgaDefense: 0.9, gkPsxg: 0.73 },
  Japan:         { top11Markt: 220, pctTop5Ligen: 0.70, uclSpieler:  5, xgAttacke: 1.4, xgaDefense: 1.1, gkPsxg: 0.71 },
  Schweden:      { top11Markt: 115, pctTop5Ligen: 0.45, uclSpieler:  2, xgAttacke: 1.1, xgaDefense: 1.3, gkPsxg: 0.67 },
  Tunesien:      { top11Markt:  35, pctTop5Ligen: 0.30, uclSpieler:  1, xgAttacke: 1.0, xgaDefense: 1.3, gkPsxg: 0.66 },
  // Gruppe G
  Belgien:       { top11Markt: 460, pctTop5Ligen: 0.80, uclSpieler:  8, xgAttacke: 1.5, xgaDefense: 1.0, gkPsxg: 0.71 },
  Ägypten:       { top11Markt:  70, pctTop5Ligen: 0.30, uclSpieler:  2, xgAttacke: 1.1, xgaDefense: 1.2, gkPsxg: 0.66 },
  Iran:          { top11Markt:  70, pctTop5Ligen: 0.25, uclSpieler:  1, xgAttacke: 1.0, xgaDefense: 1.3, gkPsxg: 0.66 },
  Neuseeland:    { top11Markt:  42, pctTop5Ligen: 0.20, uclSpieler:  0, xgAttacke: 0.9, xgaDefense: 1.4, gkPsxg: 0.64 },
  // Gruppe H
  Spanien:       { top11Markt: 820, pctTop5Ligen: 1.00, uclSpieler: 15, xgAttacke: 2.2, xgaDefense: 0.7, gkPsxg: 0.75 },
  "Kap Verde":   { top11Markt:  22, pctTop5Ligen: 0.30, uclSpieler:  1, xgAttacke: 1.0, xgaDefense: 1.4, gkPsxg: 0.64 },
  "Saudi-Arabien": { top11Markt:  26, pctTop5Ligen: 0.05, uclSpieler:  0, xgAttacke: 0.9, xgaDefense: 1.4, gkPsxg: 0.66 },
  Uruguay:       { top11Markt: 280, pctTop5Ligen: 0.75, uclSpieler:  7, xgAttacke: 1.5, xgaDefense: 1.0, gkPsxg: 0.71 },
  // Gruppe I
  Frankreich:    { top11Markt: 980, pctTop5Ligen: 0.95, uclSpieler: 15, xgAttacke: 2.1, xgaDefense: 0.8, gkPsxg: 0.74 },
  Senegal:       { top11Markt: 250, pctTop5Ligen: 0.80, uclSpieler:  5, xgAttacke: 1.4, xgaDefense: 1.0, gkPsxg: 0.70 },
  Irak:          { top11Markt:  26, pctTop5Ligen: 0.10, uclSpieler:  0, xgAttacke: 0.9, xgaDefense: 1.4, gkPsxg: 0.64 },
  Norwegen:      { top11Markt: 510, pctTop5Ligen: 0.85, uclSpieler:  8, xgAttacke: 1.8, xgaDefense: 1.0, gkPsxg: 0.71 },
  // Gruppe J
  Argentinien:   { top11Markt: 530, pctTop5Ligen: 0.85, uclSpieler: 10, xgAttacke: 1.9, xgaDefense: 0.9, gkPsxg: 0.74 },
  Algerien:      { top11Markt: 105, pctTop5Ligen: 0.55, uclSpieler:  3, xgAttacke: 1.3, xgaDefense: 1.2, gkPsxg: 0.68 },
  Österreich:    { top11Markt: 280, pctTop5Ligen: 0.85, uclSpieler:  6, xgAttacke: 1.5, xgaDefense: 1.0, gkPsxg: 0.71 },
  Jordanien:     { top11Markt:  13, pctTop5Ligen: 0.05, uclSpieler:  0, xgAttacke: 0.8, xgaDefense: 1.5, gkPsxg: 0.63 },
  // Gruppe K
  Portugal:      { top11Markt: 660, pctTop5Ligen: 0.90, uclSpieler: 12, xgAttacke: 1.9, xgaDefense: 0.9, gkPsxg: 0.73 },
  "DR Kongo":    { top11Markt:  70, pctTop5Ligen: 0.55, uclSpieler:  2, xgAttacke: 1.1, xgaDefense: 1.3, gkPsxg: 0.67 },
  Usbekistan:    { top11Markt:  26, pctTop5Ligen: 0.10, uclSpieler:  0, xgAttacke: 0.9, xgaDefense: 1.3, gkPsxg: 0.65 },
  Kolumbien:     { top11Markt: 295, pctTop5Ligen: 0.80, uclSpieler:  6, xgAttacke: 1.5, xgaDefense: 1.0, gkPsxg: 0.71 },
  // Gruppe L
  England:       { top11Markt: 1150, pctTop5Ligen: 1.00, uclSpieler: 15, xgAttacke: 2.0, xgaDefense: 0.8, gkPsxg: 0.74 },
  Kroatien:      { top11Markt: 350, pctTop5Ligen: 0.80, uclSpieler:  7, xgAttacke: 1.5, xgaDefense: 1.0, gkPsxg: 0.71 },
  Ghana:         { top11Markt: 225, pctTop5Ligen: 0.65, uclSpieler:  4, xgAttacke: 1.3, xgaDefense: 1.2, gkPsxg: 0.68 },
  Panama:        { top11Markt:  22, pctTop5Ligen: 0.20, uclSpieler:  0, xgAttacke: 0.9, xgaDefense: 1.4, gkPsxg: 0.64 },
};
