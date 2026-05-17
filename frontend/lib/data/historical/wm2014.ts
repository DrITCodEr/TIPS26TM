import type { HistoricalTournament } from "@/lib/types/backtest";

/**
 * WM 2014 (Brasilien) — K.o.-Phase + Pre-Turnier-Snapshot der 16 Achtelfinalisten.
 *
 * Pre-Turnier-Werte sind Annäherungen (eloratings.net Mai 2014, FIFA-Ranking
 * Juni 2014, transfermarkt). `heim` = 1 für Brasilien.
 */
export const WM_2014: HistoricalTournament = {
  year: 2014,
  host: "Brasilien",
  teams: [
    { name: "Brasilien",     flag: "🇧🇷", elo: 2079, fifa: 1259, markt: 540, form: 0.80, heim: 1, wmHF: 10, trainer: 7, star: 60,  hoehe: 0 },
    { name: "Deutschland",   flag: "🇩🇪", elo: 2092, fifa: 1300, markt: 645, form: 0.80, heim: 0, wmHF: 12, trainer: 8, star: 70,  hoehe: 0 },
    { name: "Argentinien",   flag: "🇦🇷", elo: 2027, fifa: 1251, markt: 480, form: 0.75, heim: 0, wmHF:  4, trainer: 6, star: 140, hoehe: 0 },
    { name: "Niederlande",   flag: "🇳🇱", elo: 1990, fifa: 1106, markt: 380, form: 0.80, heim: 0, wmHF:  4, trainer: 8, star: 70,  hoehe: 0 },
    { name: "Kolumbien",     flag: "🇨🇴", elo: 1969, fifa: 1186, markt: 220, form: 0.80, heim: 0, wmHF:  0, trainer: 7, star: 80,  hoehe: 0 },
    { name: "Belgien",       flag: "🇧🇪", elo: 1910, fifa: 1074, markt: 380, form: 0.75, heim: 0, wmHF:  0, trainer: 6, star: 60,  hoehe: 0 },
    { name: "Frankreich",    flag: "🇫🇷", elo: 1923, fifa: 936,  markt: 450, form: 0.70, heim: 0, wmHF:  6, trainer: 7, star: 80,  hoehe: 0 },
    { name: "Costa Rica",    flag: "🇨🇷", elo: 1782, fifa: 762,  markt:  35, form: 0.75, heim: 0, wmHF:  0, trainer: 6, star:  8,  hoehe: 0 },
    { name: "Schweiz",       flag: "🇨🇭", elo: 1898, fifa: 1149, markt: 130, form: 0.65, heim: 0, wmHF:  0, trainer: 6, star: 30,  hoehe: 0 },
    { name: "USA",           flag: "🇺🇸", elo: 1764, fifa: 1014, markt: 110, form: 0.65, heim: 0, wmHF:  1, trainer: 7, star: 25,  hoehe: 0 },
    { name: "Chile",         flag: "🇨🇱", elo: 1947, fifa: 1051, markt: 140, form: 0.70, heim: 0, wmHF:  1, trainer: 7, star: 40,  hoehe: 0 },
    { name: "Algerien",      flag: "🇩🇿", elo: 1689, fifa: 821,  markt:  50, form: 0.65, heim: 0, wmHF:  0, trainer: 5, star: 15,  hoehe: 0 },
    { name: "Uruguay",       flag: "🇺🇾", elo: 1985, fifa: 1147, markt: 180, form: 0.70, heim: 0, wmHF:  3, trainer: 8, star: 60,  hoehe: 0 },
    { name: "Mexiko",        flag: "🇲🇽", elo: 1843, fifa: 870,  markt: 130, form: 0.65, heim: 0, wmHF:  0, trainer: 6, star: 20,  hoehe: 0 },
    { name: "Griechenland",  flag: "🇬🇷", elo: 1801, fifa: 1116, markt: 110, form: 0.55, heim: 0, wmHF:  0, trainer: 5, star: 18,  hoehe: 0 },
    { name: "Nigeria",       flag: "🇳🇬", elo: 1693, fifa: 750,  markt:  90, form: 0.55, heim: 0, wmHF:  0, trainer: 5, star: 18,  hoehe: 0 },
  ],
  matches: [
    // Achtelfinale
    { phase: "r16", teamA: "Brasilien",   teamB: "Chile",       goalsA: 1, goalsB: 1, winner: "Brasilien" }, // Elfer
    { phase: "r16", teamA: "Kolumbien",   teamB: "Uruguay",     goalsA: 2, goalsB: 0, winner: "Kolumbien" },
    { phase: "r16", teamA: "Niederlande", teamB: "Mexiko",      goalsA: 2, goalsB: 1, winner: "Niederlande" },
    { phase: "r16", teamA: "Costa Rica",  teamB: "Griechenland", goalsA: 1, goalsB: 1, winner: "Costa Rica" }, // Elfer
    { phase: "r16", teamA: "Frankreich",  teamB: "Nigeria",     goalsA: 2, goalsB: 0, winner: "Frankreich" },
    { phase: "r16", teamA: "Deutschland", teamB: "Algerien",    goalsA: 2, goalsB: 1, winner: "Deutschland" },
    { phase: "r16", teamA: "Argentinien", teamB: "Schweiz",     goalsA: 1, goalsB: 0, winner: "Argentinien" },
    { phase: "r16", teamA: "Belgien",     teamB: "USA",         goalsA: 2, goalsB: 1, winner: "Belgien" },
    // Viertelfinale
    { phase: "qf",  teamA: "Brasilien",   teamB: "Kolumbien",   goalsA: 2, goalsB: 1, winner: "Brasilien" },
    { phase: "qf",  teamA: "Niederlande", teamB: "Costa Rica",  goalsA: 0, goalsB: 0, winner: "Niederlande" }, // Elfer
    { phase: "qf",  teamA: "Deutschland", teamB: "Frankreich",  goalsA: 1, goalsB: 0, winner: "Deutschland" },
    { phase: "qf",  teamA: "Argentinien", teamB: "Belgien",     goalsA: 1, goalsB: 0, winner: "Argentinien" },
    // Halbfinale
    { phase: "sf",  teamA: "Brasilien",   teamB: "Deutschland", goalsA: 1, goalsB: 7, winner: "Deutschland" },
    { phase: "sf",  teamA: "Niederlande", teamB: "Argentinien", goalsA: 0, goalsB: 0, winner: "Argentinien" }, // Elfer
    // 3. Platz + Finale
    { phase: "3rd", teamA: "Brasilien",   teamB: "Niederlande", goalsA: 0, goalsB: 3, winner: "Niederlande" },
    { phase: "final", teamA: "Deutschland", teamB: "Argentinien", goalsA: 1, goalsB: 0, winner: "Deutschland" },
  ],
  champion: "Deutschland",
  runnerUp: "Argentinien",
  semiFinalists: ["Niederlande", "Brasilien"],
};
