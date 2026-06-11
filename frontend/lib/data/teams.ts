import type { Team } from "@/lib/types/team";

/**
 * Alle 48 Teams der WM 2026.
 *
 * Source-of-Truth: HTML-Prototyp `wm2026-vorhersage.html` Zeilen 2189-2238.
 * Stand: Mai 2026 · ELO via eloratings.net · FIFA via fifa.com · Marktwerte
 * via transfermarkt.de · Form aus Punkten der letzten ~10 Spiele.
 *
 * Reihenfolge: gruppenweise A → L (4 Teams je Gruppe).
 */
export const TEAMS: Team[] = [
  // Gruppe A
  { name: "Mexiko",        group: "A", rang: 15, elo: 1830, fifa: 1690, markt: 110,  form: 0.60, heim: 1, wmHF: 0, trainer: 6, star: 25,  hoehe:  0.10, flag: "🇲🇽" },
  { name: "Südafrika",     group: "A", rang: 64, elo: 1640, fifa: 1450, markt:  25,  form: 0.55, heim: 0, wmHF: 0, trainer: 5, star:  8,  hoehe:  0,    flag: "🇿🇦" },
  { name: "Südkorea",      group: "A", rang: 23, elo: 1770, fifa: 1600, markt: 210,  form: 0.55, heim: 0, wmHF: 0, trainer: 6, star: 60,  hoehe: -0.05, flag: "🇰🇷" },
  { name: "Tschechien",    group: "A", rang: 43, elo: 1720, fifa: 1500, markt: 150,  form: 0.50, heim: 0, wmHF: 0, trainer: 5, star: 30,  hoehe: -0.05, flag: "🇨🇿" },
  // Gruppe B
  { name: "Kanada",        group: "B", rang: 27, elo: 1750, fifa: 1570, markt: 110,  form: 0.55, heim: 1, wmHF: 0, trainer: 7, star: 60,  hoehe:  0,    flag: "🇨🇦" },
  { name: "Bosnien",       group: "B", rang: 67, elo: 1630, fifa: 1400, markt:  60,  form: 0.60, heim: 0, wmHF: 0, trainer: 5, star: 15,  hoehe:  0,    flag: "🇧🇦" },
  { name: "Katar",         group: "B", rang: 60, elo: 1610, fifa: 1410, markt:  15,  form: 0.40, heim: 0, wmHF: 0, trainer: 4, star:  5,  hoehe:  0,    flag: "🇶🇦" },
  { name: "Schweiz",       group: "B", rang: 17, elo: 1820, fifa: 1660, markt: 280,  form: 0.60, heim: 0, wmHF: 0, trainer: 6, star: 50,  hoehe:  0,    flag: "🇨🇭" },
  // Gruppe C
  { name: "Brasilien",     group: "C", rang:  6, elo: 2030, fifa: 1790, markt: 900,  form: 0.65, heim: 0, wmHF: 2, trainer: 9, star: 150, hoehe:  0,    flag: "🇧🇷" },
  { name: "Marokko",       group: "C", rang:  8, elo: 1970, fifa: 1750, markt: 250,  form: 0.68, heim: 0, wmHF: 1, trainer: 7, star: 75,  hoehe:  0,    flag: "🇲🇦" },
  { name: "Haiti",         group: "C", rang: 84, elo: 1560, fifa: 1320, markt:  30,  form: 0.40, heim: 0, wmHF: 0, trainer: 4, star:  6,  hoehe:  0,    flag: "🇭🇹" },
  { name: "Schottland",    group: "C", rang: 36, elo: 1730, fifa: 1530, markt: 140,  form: 0.55, heim: 0, wmHF: 0, trainer: 6, star: 30,  hoehe: -0.05, flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  // Gruppe D
  { name: "USA",           group: "D", rang: 14, elo: 1830, fifa: 1700, markt: 290,  form: 0.50, heim: 1, wmHF: 0, trainer: 8, star: 50,  hoehe:  0,    flag: "🇺🇸" },
  { name: "Paraguay",      group: "D", rang: 39, elo: 1720, fifa: 1520, markt:  30,  form: 0.55, heim: 0, wmHF: 0, trainer: 5, star: 12,  hoehe:  0,    flag: "🇵🇾" },
  { name: "Australien",    group: "D", rang: 26, elo: 1750, fifa: 1580, markt:  50,  form: 0.55, heim: 0, wmHF: 0, trainer: 6, star: 15,  hoehe: -0.05, flag: "🇦🇺" },
  { name: "Türkei",        group: "D", rang: 24, elo: 1800, fifa: 1610, markt: 460,  form: 0.62, heim: 0, wmHF: 0, trainer: 6, star: 80,  hoehe: -0.05, flag: "🇹🇷" },
  // Gruppe E
  { name: "Deutschland",   group: "E", rang:  9, elo: 1990, fifa: 1730, markt: 870,  form: 0.70, heim: 0, wmHF: 0, trainer: 6, star: 140, hoehe:  0,    flag: "🇩🇪" },
  { name: "Curaçao",       group: "E", rang: 82, elo: 1570, fifa: 1340, markt:  32,  form: 0.55, heim: 0, wmHF: 0, trainer: 5, star:  8,  hoehe:  0,    flag: "🇨🇼" },
  { name: "Elfenbeink.",   group: "E", rang: 41, elo: 1720, fifa: 1520, markt: 150,  form: 0.60, heim: 0, wmHF: 0, trainer: 5, star: 40,  hoehe:  0,    flag: "🇨🇮" },
  { name: "Ecuador",       group: "E", rang: 24, elo: 1790, fifa: 1620, markt: 160,  form: 0.65, heim: 0, wmHF: 0, trainer: 6, star: 40,  hoehe:  0.05, flag: "🇪🇨" },
  // Gruppe F
  { name: "Niederlande",   group: "F", rang:  7, elo: 2020, fifa: 1770, markt: 700,  form: 0.70, heim: 0, wmHF: 1, trainer: 7, star: 80,  hoehe:  0,    flag: "🇳🇱" },
  { name: "Japan",         group: "F", rang: 18, elo: 1810, fifa: 1650, markt: 250,  form: 0.65, heim: 0, wmHF: 0, trainer: 6, star: 40,  hoehe:  0,    flag: "🇯🇵" },
  { name: "Schweden",      group: "F", rang: 33, elo: 1740, fifa: 1530, markt: 130,  form: 0.45, heim: 0, wmHF: 0, trainer: 6, star: 35,  hoehe: -0.05, flag: "🇸🇪" },
  { name: "Tunesien",      group: "F", rang: 40, elo: 1700, fifa: 1500, markt:  40,  form: 0.55, heim: 0, wmHF: 0, trainer: 5, star: 10,  hoehe:  0,    flag: "🇹🇳" },
  // Gruppe G
  { name: "Belgien",       group: "G", rang: 10, elo: 1880, fifa: 1700, markt: 520,  form: 0.55, heim: 0, wmHF: 1, trainer: 5, star: 50,  hoehe:  0,    flag: "🇧🇪" },
  { name: "Ägypten",       group: "G", rang: 34, elo: 1700, fifa: 1490, markt:  80,  form: 0.55, heim: 0, wmHF: 0, trainer: 5, star: 50,  hoehe:  0,    flag: "🇪🇬" },
  { name: "Iran",          group: "G", rang: 21, elo: 1700, fifa: 1640, markt:  80,  form: 0.45, heim: 0, wmHF: 0, trainer: 5, star: 15,  hoehe:  0,    flag: "🇮🇷" },
  { name: "Neuseeland",    group: "G", rang: 85, elo: 1530, fifa: 1300, markt:  50,  form: 0.45, heim: 0, wmHF: 0, trainer: 5, star: 10,  hoehe:  0,    flag: "🇳🇿" },
  // Gruppe H
  { name: "Spanien",       group: "H", rang:  2, elo: 2085, fifa: 1876, markt: 920,  form: 0.85, heim: 0, wmHF: 1, trainer: 8, star: 200, hoehe:  0,    flag: "🇪🇸" },
  { name: "Kap Verde",     group: "H", rang: 68, elo: 1620, fifa: 1410, markt:  25,  form: 0.55, heim: 0, wmHF: 0, trainer: 5, star:  8,  hoehe:  0,    flag: "🇨🇻" },
  { name: "Saudi-Arabien", group: "H", rang: 62, elo: 1640, fifa: 1430, markt:  30,  form: 0.45, heim: 0, wmHF: 0, trainer: 6, star: 12,  hoehe:  0,    flag: "🇸🇦" },
  { name: "Uruguay",       group: "H", rang: 16, elo: 1860, fifa: 1660, markt: 310,  form: 0.60, heim: 0, wmHF: 1, trainer: 8, star: 65,  hoehe:  0,    flag: "🇺🇾" },
  // Gruppe I
  { name: "Frankreich",    group: "I", rang:  1, elo: 2090, fifa: 1880, markt: 1280, form: 0.80, heim: 0, wmHF: 3, trainer: 9, star: 180, hoehe:  0,    flag: "🇫🇷" },
  { name: "Senegal",       group: "I", rang: 19, elo: 1790, fifa: 1640, markt: 280,  form: 0.60, heim: 0, wmHF: 0, trainer: 6, star: 50,  hoehe:  0,    flag: "🇸🇳" },
  { name: "Irak",          group: "I", rang: 58, elo: 1650, fifa: 1430, markt:  30,  form: 0.55, heim: 0, wmHF: 0, trainer: 4, star:  8,  hoehe:  0,    flag: "🇮🇶" },
  { name: "Norwegen",      group: "I", rang: 29, elo: 1820, fifa: 1590, markt: 584,  form: 0.75, heim: 0, wmHF: 0, trainer: 6, star: 180, hoehe: -0.05, flag: "🇳🇴" },
  // Gruppe J
  { name: "Argentinien",   group: "J", rang:  3, elo: 2080, fifa: 1874, markt: 600,  form: 0.82, heim: 0, wmHF: 3, trainer: 9, star: 60,  hoehe:  0,    flag: "🇦🇷" },
  { name: "Algerien",      group: "J", rang: 35, elo: 1720, fifa: 1530, markt: 120,  form: 0.55, heim: 0, wmHF: 0, trainer: 5, star: 25,  hoehe:  0,    flag: "🇩🇿" },
  { name: "Österreich",    group: "J", rang: 25, elo: 1810, fifa: 1610, markt: 310,  form: 0.68, heim: 0, wmHF: 0, trainer: 8, star: 70,  hoehe: -0.05, flag: "🇦🇹" },
  { name: "Jordanien",     group: "J", rang: 66, elo: 1620, fifa: 1420, markt:  16,  form: 0.55, heim: 0, wmHF: 0, trainer: 5, star:  5,  hoehe:  0,    flag: "🇯🇴" },
  // Gruppe K
  { name: "Portugal",      group: "K", rang:  5, elo: 2045, fifa: 1810, markt: 750,  form: 0.72, heim: 0, wmHF: 0, trainer: 7, star: 90,  hoehe:  0,    flag: "🇵🇹" },
  { name: "DR Kongo",      group: "K", rang: 58, elo: 1660, fifa: 1450, markt:  80,  form: 0.55, heim: 0, wmHF: 0, trainer: 5, star: 25,  hoehe:  0,    flag: "🇨🇩" },
  { name: "Usbekistan",    group: "K", rang: 57, elo: 1680, fifa: 1460, markt:  30,  form: 0.60, heim: 0, wmHF: 0, trainer: 5, star: 10,  hoehe:  0,    flag: "🇺🇿" },
  { name: "Kolumbien",     group: "K", rang: 13, elo: 1860, fifa: 1700, markt: 330,  form: 0.62, heim: 0, wmHF: 0, trainer: 7, star: 80,  hoehe:  0,    flag: "🇨🇴" },
  // Gruppe L
  { name: "England",       group: "L", rang:  4, elo: 2060, fifa: 1830, markt: 1300, form: 0.75, heim: 0, wmHF: 2, trainer: 8, star: 140, hoehe:  0,    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "Kroatien",      group: "L", rang: 11, elo: 1950, fifa: 1680, markt: 400,  form: 0.70, heim: 0, wmHF: 2, trainer: 7, star: 30,  hoehe:  0,    flag: "🇭🇷" },
  { name: "Ghana",         group: "L", rang: 72, elo: 1600, fifa: 1380, markt: 255,  form: 0.50, heim: 0, wmHF: 0, trainer: 5, star: 35,  hoehe:  0,    flag: "🇬🇭" },
  { name: "Panama",        group: "L", rang: 30, elo: 1700, fifa: 1500, markt:  25,  form: 0.55, heim: 0, wmHF: 0, trainer: 5, star:  8,  hoehe:  0,    flag: "🇵🇦" },
];

export const TEAM_IDX_BY_NAME: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  TEAMS.forEach((t, i) => {
    out[t.name] = i;
  });
  return out;
})();
