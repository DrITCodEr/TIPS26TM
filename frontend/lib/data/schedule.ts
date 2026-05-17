import type { Match } from "@/lib/types/match";
import { TEAM_IDX_BY_NAME } from "./teams";

/**
 * Alle 72 Gruppenphasen-Spiele der WM 2026.
 *
 * Source-of-Truth: HTML-Prototyp `wm2026-vorhersage.html` Zeilen 2310-2400.
 * Zeiten in MESZ (Eastern Time = MESZ - 6h).
 *
 * `idxA` / `idxB` werden beim Modul-Laden über `TEAM_IDX_BY_NAME` aufgelöst.
 */
const RAW_SCHEDULE: Omit<Match, "idxA" | "idxB">[] = [
  // 11. Juni
  { date: "Do, 11.06.", time: "21:00", group: "A", teamA: "Mexiko",        teamB: "Südafrika",     venue: "Estadio Azteca, Mexico City" },
  { date: "Fr, 12.06.", time: "04:00", group: "A", teamA: "Südkorea",      teamB: "Tschechien",    venue: "Estadio Akron, Zapopan" },
  // 12. Juni
  { date: "Fr, 12.06.", time: "21:00", group: "B", teamA: "Kanada",        teamB: "Bosnien",       venue: "BMO Field, Toronto" },
  { date: "Sa, 13.06.", time: "03:00", group: "D", teamA: "USA",           teamB: "Paraguay",      venue: "SoFi Stadium, Inglewood" },
  // 13. Juni
  { date: "Sa, 13.06.", time: "21:00", group: "B", teamA: "Katar",         teamB: "Schweiz",       venue: "Levi's Stadium, Santa Clara" },
  { date: "So, 14.06.", time: "00:00", group: "C", teamA: "Brasilien",     teamB: "Marokko",       venue: "MetLife Stadium, NY/NJ" },
  { date: "So, 14.06.", time: "03:00", group: "C", teamA: "Haiti",         teamB: "Schottland",    venue: "Gillette Stadium, Foxborough" },
  // 14. Juni
  { date: "So, 14.06.", time: "06:00", group: "D", teamA: "Australien",    teamB: "Türkei",        venue: "BC Place, Vancouver" },
  { date: "So, 14.06.", time: "19:00", group: "E", teamA: "Deutschland",   teamB: "Curaçao",       venue: "NRG Stadium, Houston" },
  { date: "So, 14.06.", time: "22:00", group: "F", teamA: "Niederlande",   teamB: "Japan",         venue: "AT&T Stadium, Arlington" },
  { date: "Mo, 15.06.", time: "01:00", group: "E", teamA: "Elfenbeink.",   teamB: "Ecuador",       venue: "Lincoln Financial Field, Philadelphia" },
  { date: "Mo, 15.06.", time: "04:00", group: "F", teamA: "Schweden",      teamB: "Tunesien",      venue: "Estadio BBVA, Monterrey" },
  // 15. Juni
  { date: "Mo, 15.06.", time: "18:00", group: "H", teamA: "Spanien",       teamB: "Kap Verde",     venue: "Mercedes-Benz Stadium, Atlanta" },
  { date: "Mo, 15.06.", time: "21:00", group: "G", teamA: "Belgien",       teamB: "Ägypten",       venue: "Lumen Field, Seattle" },
  { date: "Di, 16.06.", time: "00:00", group: "H", teamA: "Saudi-Arabien", teamB: "Uruguay",       venue: "Hard Rock Stadium, Miami" },
  { date: "Di, 16.06.", time: "03:00", group: "G", teamA: "Iran",          teamB: "Neuseeland",    venue: "SoFi Stadium, Inglewood" },
  // 16. Juni
  { date: "Di, 16.06.", time: "21:00", group: "I", teamA: "Frankreich",    teamB: "Senegal",       venue: "MetLife Stadium, NY/NJ" },
  { date: "Mi, 17.06.", time: "00:00", group: "I", teamA: "Irak",          teamB: "Norwegen",      venue: "Gillette Stadium, Foxborough" },
  { date: "Mi, 17.06.", time: "03:00", group: "J", teamA: "Argentinien",   teamB: "Algerien",      venue: "Arrowhead Stadium, Kansas City" },
  // 17. Juni
  { date: "Mi, 17.06.", time: "06:00", group: "J", teamA: "Österreich",    teamB: "Jordanien",     venue: "Levi's Stadium, Santa Clara" },
  { date: "Mi, 17.06.", time: "19:00", group: "K", teamA: "Portugal",      teamB: "DR Kongo",      venue: "NRG Stadium, Houston" },
  { date: "Mi, 17.06.", time: "22:00", group: "L", teamA: "England",       teamB: "Kroatien",      venue: "AT&T Stadium, Arlington" },
  { date: "Do, 18.06.", time: "01:00", group: "L", teamA: "Ghana",         teamB: "Panama",        venue: "BMO Field, Toronto" },
  { date: "Do, 18.06.", time: "04:00", group: "K", teamA: "Usbekistan",    teamB: "Kolumbien",     venue: "Estadio Azteca, Mexico City" },
  // 18. Juni
  { date: "Do, 18.06.", time: "18:00", group: "A", teamA: "Tschechien",    teamB: "Südafrika",     venue: "Mercedes-Benz Stadium, Atlanta" },
  { date: "Do, 18.06.", time: "21:00", group: "B", teamA: "Schweiz",       teamB: "Bosnien",       venue: "SoFi Stadium, Inglewood" },
  { date: "Fr, 19.06.", time: "00:00", group: "B", teamA: "Kanada",        teamB: "Katar",         venue: "BC Place, Vancouver" },
  { date: "Fr, 19.06.", time: "03:00", group: "A", teamA: "Mexiko",        teamB: "Südkorea",      venue: "Estadio Akron, Zapopan" },
  // 19. Juni
  { date: "Fr, 19.06.", time: "21:00", group: "D", teamA: "USA",           teamB: "Australien",    venue: "Lumen Field, Seattle" },
  { date: "Sa, 20.06.", time: "00:00", group: "C", teamA: "Schottland",    teamB: "Marokko",       venue: "Gillette Stadium, Foxborough" },
  { date: "Sa, 20.06.", time: "02:30", group: "C", teamA: "Brasilien",     teamB: "Haiti",         venue: "Lincoln Financial Field, Philadelphia" },
  { date: "Sa, 20.06.", time: "05:00", group: "D", teamA: "Türkei",        teamB: "Paraguay",      venue: "Levi's Stadium, Santa Clara" },
  // 20. Juni
  { date: "Sa, 20.06.", time: "19:00", group: "F", teamA: "Niederlande",   teamB: "Schweden",      venue: "NRG Stadium, Houston" },
  { date: "Sa, 20.06.", time: "22:00", group: "E", teamA: "Deutschland",   teamB: "Elfenbeink.",   venue: "BMO Field, Toronto" },
  { date: "So, 21.06.", time: "02:00", group: "E", teamA: "Ecuador",       teamB: "Curaçao",       venue: "Arrowhead Stadium, Kansas City" },
  // 21. Juni
  { date: "So, 21.06.", time: "06:00", group: "F", teamA: "Tunesien",      teamB: "Japan",         venue: "Estadio BBVA, Monterrey" },
  { date: "So, 21.06.", time: "18:00", group: "H", teamA: "Spanien",       teamB: "Saudi-Arabien", venue: "Mercedes-Benz Stadium, Atlanta" },
  { date: "So, 21.06.", time: "21:00", group: "G", teamA: "Belgien",       teamB: "Iran",          venue: "SoFi Stadium, Inglewood" },
  { date: "Mo, 22.06.", time: "00:00", group: "H", teamA: "Uruguay",       teamB: "Kap Verde",     venue: "Hard Rock Stadium, Miami" },
  { date: "Mo, 22.06.", time: "03:00", group: "G", teamA: "Neuseeland",    teamB: "Ägypten",       venue: "BC Place, Vancouver" },
  // 22. Juni
  { date: "Mo, 22.06.", time: "19:00", group: "J", teamA: "Argentinien",   teamB: "Österreich",    venue: "AT&T Stadium, Arlington" },
  { date: "Mo, 22.06.", time: "23:00", group: "I", teamA: "Frankreich",    teamB: "Irak",          venue: "Lincoln Financial Field, Philadelphia" },
  { date: "Di, 23.06.", time: "02:00", group: "I", teamA: "Norwegen",      teamB: "Senegal",       venue: "MetLife Stadium, NY/NJ" },
  { date: "Di, 23.06.", time: "05:00", group: "J", teamA: "Jordanien",     teamB: "Algerien",      venue: "Levi's Stadium, Santa Clara" },
  // 23. Juni
  { date: "Di, 23.06.", time: "19:00", group: "K", teamA: "Portugal",      teamB: "Usbekistan",    venue: "NRG Stadium, Houston" },
  { date: "Di, 23.06.", time: "22:00", group: "L", teamA: "England",       teamB: "Ghana",         venue: "Gillette Stadium, Foxborough" },
  { date: "Mi, 24.06.", time: "01:00", group: "L", teamA: "Panama",        teamB: "Kroatien",      venue: "BMO Field, Toronto" },
  { date: "Mi, 24.06.", time: "04:00", group: "K", teamA: "Kolumbien",     teamB: "DR Kongo",      venue: "Estadio Akron, Zapopan" },
  // 24. Juni — Final Matchday B & C & A
  { date: "Mi, 24.06.", time: "21:00", group: "B", teamA: "Schweiz",       teamB: "Kanada",        venue: "BC Place, Vancouver" },
  { date: "Mi, 24.06.", time: "21:00", group: "B", teamA: "Bosnien",       teamB: "Katar",         venue: "Lumen Field, Seattle" },
  { date: "Do, 25.06.", time: "00:00", group: "C", teamA: "Schottland",    teamB: "Brasilien",     venue: "Hard Rock Stadium, Miami" },
  { date: "Do, 25.06.", time: "00:00", group: "C", teamA: "Marokko",       teamB: "Haiti",         venue: "Mercedes-Benz Stadium, Atlanta" },
  { date: "Do, 25.06.", time: "03:00", group: "A", teamA: "Tschechien",    teamB: "Mexiko",        venue: "Estadio Azteca, Mexico City" },
  { date: "Do, 25.06.", time: "03:00", group: "A", teamA: "Südafrika",     teamB: "Südkorea",      venue: "Estadio BBVA, Monterrey" },
  // 25. Juni — Final Matchday E, F, D
  { date: "Do, 25.06.", time: "22:00", group: "E", teamA: "Curaçao",       teamB: "Elfenbeink.",   venue: "Lincoln Financial Field, Philadelphia" },
  { date: "Do, 25.06.", time: "22:00", group: "E", teamA: "Ecuador",       teamB: "Deutschland",   venue: "MetLife Stadium, NY/NJ" },
  { date: "Fr, 26.06.", time: "01:00", group: "F", teamA: "Japan",         teamB: "Schweden",      venue: "AT&T Stadium, Arlington" },
  { date: "Fr, 26.06.", time: "01:00", group: "F", teamA: "Tunesien",      teamB: "Niederlande",   venue: "Arrowhead Stadium, Kansas City" },
  { date: "Fr, 26.06.", time: "04:00", group: "D", teamA: "Türkei",        teamB: "USA",           venue: "SoFi Stadium, Inglewood" },
  { date: "Fr, 26.06.", time: "04:00", group: "D", teamA: "Paraguay",      teamB: "Australien",    venue: "Levi's Stadium, Santa Clara" },
  // 26. Juni — Final Matchday I, H, G
  { date: "Fr, 26.06.", time: "21:00", group: "I", teamA: "Norwegen",      teamB: "Frankreich",    venue: "Gillette Stadium, Foxborough" },
  { date: "Fr, 26.06.", time: "21:00", group: "I", teamA: "Senegal",       teamB: "Irak",          venue: "BMO Field, Toronto" },
  { date: "Sa, 27.06.", time: "02:00", group: "H", teamA: "Kap Verde",     teamB: "Saudi-Arabien", venue: "NRG Stadium, Houston" },
  { date: "Sa, 27.06.", time: "02:00", group: "H", teamA: "Uruguay",       teamB: "Spanien",       venue: "Estadio Akron, Zapopan" },
  { date: "Sa, 27.06.", time: "05:00", group: "G", teamA: "Ägypten",       teamB: "Iran",          venue: "Lumen Field, Seattle" },
  { date: "Sa, 27.06.", time: "05:00", group: "G", teamA: "Neuseeland",    teamB: "Belgien",       venue: "BC Place, Vancouver" },
  // 27. Juni — Final Matchday L, K, J
  { date: "Sa, 27.06.", time: "23:00", group: "L", teamA: "Panama",        teamB: "England",       venue: "MetLife Stadium, NY/NJ" },
  { date: "Sa, 27.06.", time: "23:00", group: "L", teamA: "Kroatien",      teamB: "Ghana",         venue: "Lincoln Financial Field, Philadelphia" },
  { date: "So, 28.06.", time: "01:30", group: "K", teamA: "Kolumbien",     teamB: "Portugal",      venue: "Hard Rock Stadium, Miami" },
  { date: "So, 28.06.", time: "01:30", group: "K", teamA: "DR Kongo",      teamB: "Usbekistan",    venue: "Mercedes-Benz Stadium, Atlanta" },
  { date: "So, 28.06.", time: "04:00", group: "J", teamA: "Algerien",      teamB: "Österreich",    venue: "Arrowhead Stadium, Kansas City" },
  { date: "So, 28.06.", time: "04:00", group: "J", teamA: "Jordanien",     teamB: "Argentinien",   venue: "AT&T Stadium, Arlington" },
];

function resolveTeamIdx(name: string): number {
  const idx = TEAM_IDX_BY_NAME[name];
  if (idx === undefined) {
    throw new Error(
      `Schedule references unknown team "${name}". Check lib/data/teams.ts.`,
    );
  }
  return idx;
}

export const SCHEDULE: Match[] = RAW_SCHEDULE.map((m) => ({
  ...m,
  idxA: resolveTeamIdx(m.teamA),
  idxB: resolveTeamIdx(m.teamB),
}));
