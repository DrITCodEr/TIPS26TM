import type { HistoricalTournament } from "@/lib/types/backtest";

/**
 * WM 2018 (Russland) — K.o.-Phase + Pre-Turnier-Snapshot der 16 Achtelfinalisten.
 *
 * Pre-Turnier-Werte sind Annäherungen (eloratings.net Mai 2018, FIFA-Ranking
 * Mai 2018, transfermarkt). `heim` = 1 für Russland.
 */
export const WM_2018: HistoricalTournament = {
  year: 2018,
  host: "Russland",
  teams: [
    { name: "Brasilien",     flag: "🇧🇷", elo: 2131, fifa: 1559, markt: 950,  form: 0.75, heim: 0, wmHF:  9, trainer: 8, star: 180, hoehe: 0 },
    { name: "Deutschland",   flag: "🇩🇪", elo: 2092, fifa: 1544, markt: 850,  form: 0.65, heim: 0, wmHF: 13, trainer: 9, star: 90,  hoehe: 0 },
    { name: "Spanien",       flag: "🇪🇸", elo: 2048, fifa: 1500, markt: 1040, form: 0.80, heim: 0, wmHF:  1, trainer: 6, star: 100, hoehe: 0 },
    { name: "Argentinien",   flag: "🇦🇷", elo: 1985, fifa: 1400, markt: 614,  form: 0.65, heim: 0, wmHF:  4, trainer: 6, star: 180, hoehe: 0 },
    { name: "Frankreich",    flag: "🇫🇷", elo: 1984, fifa: 1198, markt: 1080, form: 0.75, heim: 0, wmHF:  6, trainer: 8, star: 200, hoehe: 0 },
    { name: "Belgien",       flag: "🇧🇪", elo: 1931, fifa: 1346, markt: 770,  form: 0.80, heim: 0, wmHF:  0, trainer: 7, star: 150, hoehe: 0 },
    { name: "Portugal",      flag: "🇵🇹", elo: 1975, fifa: 1306, markt: 460,  form: 0.70, heim: 0, wmHF:  1, trainer: 6, star: 100, hoehe: 0 },
    { name: "England",       flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", elo: 1941, fifa: 1051, markt: 880,  form: 0.65, heim: 0, wmHF:  2, trainer: 6, star: 120, hoehe: 0 },
    { name: "Kroatien",      flag: "🇭🇷", elo: 1859, fifa: 1118, markt: 380,  form: 0.65, heim: 0, wmHF:  1, trainer: 7, star: 100, hoehe: 0 },
    { name: "Uruguay",       flag: "🇺🇾", elo: 1888, fifa: 1018, markt: 220,  form: 0.70, heim: 0, wmHF:  3, trainer: 8, star: 90,  hoehe: 0 },
    { name: "Schweiz",       flag: "🇨🇭", elo: 1879, fifa: 1199, markt: 240,  form: 0.65, heim: 0, wmHF:  0, trainer: 6, star: 35,  hoehe: 0 },
    { name: "Schweden",      flag: "🇸🇪", elo: 1796, fifa: 949,  markt: 100,  form: 0.60, heim: 0, wmHF:  0, trainer: 6, star: 25,  hoehe: 0 },
    { name: "Kolumbien",     flag: "🇨🇴", elo: 1935, fifa: 989,  markt: 240,  form: 0.65, heim: 0, wmHF:  0, trainer: 6, star: 70,  hoehe: 0 },
    { name: "Mexiko",        flag: "🇲🇽", elo: 1859, fifa: 1097, markt: 200,  form: 0.65, heim: 0, wmHF:  0, trainer: 6, star: 35,  hoehe: 0 },
    { name: "Dänemark",      flag: "🇩🇰", elo: 1843, fifa: 1051, markt: 220,  form: 0.65, heim: 0, wmHF:  0, trainer: 6, star: 80,  hoehe: 0 },
    { name: "Russland",      flag: "🇷🇺", elo: 1685, fifa: 493,  markt: 130,  form: 0.55, heim: 1, wmHF:  0, trainer: 5, star: 25,  hoehe: 0 },
    { name: "Japan",         flag: "🇯🇵", elo: 1693, fifa: 974,  markt: 130,  form: 0.55, heim: 0, wmHF:  0, trainer: 5, star: 35,  hoehe: 0 },
  ],
  matches: [
    // Achtelfinale
    { phase: "r16", teamA: "Frankreich",  teamB: "Argentinien", goalsA: 4, goalsB: 3, winner: "Frankreich" },
    { phase: "r16", teamA: "Uruguay",     teamB: "Portugal",    goalsA: 2, goalsB: 1, winner: "Uruguay" },
    { phase: "r16", teamA: "Spanien",     teamB: "Russland",    goalsA: 1, goalsB: 1, winner: "Russland" }, // Elfer
    { phase: "r16", teamA: "Kroatien",    teamB: "Dänemark",    goalsA: 1, goalsB: 1, winner: "Kroatien" }, // Elfer
    { phase: "r16", teamA: "Brasilien",   teamB: "Mexiko",      goalsA: 2, goalsB: 0, winner: "Brasilien" },
    { phase: "r16", teamA: "Belgien",     teamB: "Japan",       goalsA: 3, goalsB: 2, winner: "Belgien" },
    { phase: "r16", teamA: "Schweden",    teamB: "Schweiz",     goalsA: 1, goalsB: 0, winner: "Schweden" },
    { phase: "r16", teamA: "Kolumbien",   teamB: "England",     goalsA: 1, goalsB: 1, winner: "England" },  // Elfer
    // Viertelfinale
    { phase: "qf",  teamA: "Uruguay",     teamB: "Frankreich",  goalsA: 0, goalsB: 2, winner: "Frankreich" },
    { phase: "qf",  teamA: "Brasilien",   teamB: "Belgien",     goalsA: 1, goalsB: 2, winner: "Belgien" },
    { phase: "qf",  teamA: "Schweden",    teamB: "England",     goalsA: 0, goalsB: 2, winner: "England" },
    { phase: "qf",  teamA: "Russland",    teamB: "Kroatien",    goalsA: 2, goalsB: 2, winner: "Kroatien" }, // Elfer
    // Halbfinale
    { phase: "sf",  teamA: "Frankreich",  teamB: "Belgien",     goalsA: 1, goalsB: 0, winner: "Frankreich" },
    { phase: "sf",  teamA: "Kroatien",    teamB: "England",     goalsA: 2, goalsB: 1, winner: "Kroatien" },
    // 3. Platz + Finale
    { phase: "3rd", teamA: "Belgien",     teamB: "England",     goalsA: 2, goalsB: 0, winner: "Belgien" },
    { phase: "final", teamA: "Frankreich", teamB: "Kroatien",   goalsA: 4, goalsB: 2, winner: "Frankreich" },
  ],
  champion: "Frankreich",
  runnerUp: "Kroatien",
  semiFinalists: ["Belgien", "England"],
};
