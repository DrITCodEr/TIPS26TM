import type { HistoricalTournament } from "@/lib/types/backtest";

/**
 * WM 2022 (Katar) — K.o.-Phase + Pre-Turnier-Snapshot der 16 Achtelfinalisten.
 *
 * Quelle Daten: Pre-Turnier-Werte sind Annäherungen aus öffentlich bekannten
 * Rankings (ELO via eloratings.net Mitte Nov. 2022, FIFA-Ranking Okt. 2022,
 * Marktwerte via transfermarkt Ende 2022). Match-Ergebnisse sind exakt.
 *
 * Anmerkung: `heim` ist hier 0, weil keines dieser Teams Heimnation Katars war
 * — Katar selbst schied in der Gruppenphase aus.
 */
export const WM_2022: HistoricalTournament = {
  year: 2022,
  host: "Katar",
  teams: [
    { name: "Brasilien",     flag: "🇧🇷", elo: 2169, fifa: 1841, markt: 1140, form: 0.80, heim: 0, wmHF: 11, trainer: 8, star: 140, hoehe: 0 },
    { name: "Argentinien",   flag: "🇦🇷", elo: 2141, fifa: 1773, markt: 645,  form: 0.85, heim: 0, wmHF:  5, trainer: 8, star: 80,  hoehe: 0 },
    { name: "Frankreich",    flag: "🇫🇷", elo: 2005, fifa: 1759, markt: 1080, form: 0.65, heim: 0, wmHF:  7, trainer: 9, star: 180, hoehe: 0 },
    { name: "England",       flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", elo: 1969, fifa: 1728, markt: 1310, form: 0.75, heim: 0, wmHF:  3, trainer: 7, star: 150, hoehe: 0 },
    { name: "Spanien",       flag: "🇪🇸", elo: 2005, fifa: 1716, markt:  920, form: 0.70, heim: 0, wmHF:  1, trainer: 7, star: 100, hoehe: 0 },
    { name: "Niederlande",   flag: "🇳🇱", elo: 2040, fifa: 1695, markt:  680, form: 0.75, heim: 0, wmHF:  5, trainer: 8, star: 90,  hoehe: 0 },
    { name: "Portugal",      flag: "🇵🇹", elo: 2004, fifa: 1676, markt:  840, form: 0.65, heim: 0, wmHF:  2, trainer: 7, star: 100, hoehe: 0 },
    { name: "Kroatien",      flag: "🇭🇷", elo: 1936, fifa: 1645, markt:  370, form: 0.60, heim: 0, wmHF:  3, trainer: 7, star: 50,  hoehe: 0 },
    { name: "Marokko",       flag: "🇲🇦", elo: 1812, fifa: 1567, markt:  240, form: 0.70, heim: 0, wmHF:  0, trainer: 6, star: 50,  hoehe: 0 },
    { name: "Senegal",       flag: "🇸🇳", elo: 1730, fifa: 1554, markt:  260, form: 0.70, heim: 0, wmHF:  0, trainer: 6, star: 75,  hoehe: 0 },
    { name: "Schweiz",       flag: "🇨🇭", elo: 1880, fifa: 1631, markt:  290, form: 0.55, heim: 0, wmHF:  0, trainer: 6, star: 60,  hoehe: 0 },
    { name: "USA",           flag: "🇺🇸", elo: 1798, fifa: 1626, markt:  300, form: 0.60, heim: 0, wmHF:  1, trainer: 6, star: 50,  hoehe: 0 },
    { name: "Japan",         flag: "🇯🇵", elo: 1816, fifa: 1559, markt:  250, form: 0.65, heim: 0, wmHF:  0, trainer: 6, star: 30,  hoehe: 0 },
    { name: "Südkorea",      flag: "🇰🇷", elo: 1746, fifa: 1530, markt:  150, form: 0.55, heim: 0, wmHF:  1, trainer: 6, star: 60,  hoehe: 0 },
    { name: "Australien",    flag: "🇦🇺", elo: 1720, fifa: 1488, markt:   40, form: 0.55, heim: 0, wmHF:  0, trainer: 6, star: 15,  hoehe: 0 },
    { name: "Polen",         flag: "🇵🇱", elo: 1773, fifa: 1548, markt:  220, form: 0.50, heim: 0, wmHF:  0, trainer: 5, star: 50,  hoehe: 0 },
  ],
  matches: [
    // Achtelfinale
    { phase: "r16", teamA: "Niederlande", teamB: "USA",        goalsA: 3, goalsB: 1, winner: "Niederlande" },
    { phase: "r16", teamA: "Argentinien", teamB: "Australien", goalsA: 2, goalsB: 1, winner: "Argentinien" },
    { phase: "r16", teamA: "Frankreich",  teamB: "Polen",      goalsA: 3, goalsB: 1, winner: "Frankreich" },
    { phase: "r16", teamA: "England",     teamB: "Senegal",    goalsA: 3, goalsB: 0, winner: "England" },
    { phase: "r16", teamA: "Japan",       teamB: "Kroatien",   goalsA: 1, goalsB: 1, winner: "Kroatien" }, // Elfer
    { phase: "r16", teamA: "Brasilien",   teamB: "Südkorea",   goalsA: 4, goalsB: 1, winner: "Brasilien" },
    { phase: "r16", teamA: "Marokko",     teamB: "Spanien",    goalsA: 0, goalsB: 0, winner: "Marokko" }, // Elfer
    { phase: "r16", teamA: "Portugal",    teamB: "Schweiz",    goalsA: 6, goalsB: 1, winner: "Portugal" },
    // Viertelfinale
    { phase: "qf",  teamA: "Kroatien",    teamB: "Brasilien",  goalsA: 1, goalsB: 1, winner: "Kroatien" },
    { phase: "qf",  teamA: "Niederlande", teamB: "Argentinien",goalsA: 2, goalsB: 2, winner: "Argentinien" },
    { phase: "qf",  teamA: "Marokko",     teamB: "Portugal",   goalsA: 1, goalsB: 0, winner: "Marokko" },
    { phase: "qf",  teamA: "England",     teamB: "Frankreich", goalsA: 1, goalsB: 2, winner: "Frankreich" },
    // Halbfinale
    { phase: "sf",  teamA: "Argentinien", teamB: "Kroatien",   goalsA: 3, goalsB: 0, winner: "Argentinien" },
    { phase: "sf",  teamA: "Frankreich",  teamB: "Marokko",    goalsA: 2, goalsB: 0, winner: "Frankreich" },
    // 3. Platz + Finale
    { phase: "3rd", teamA: "Kroatien",    teamB: "Marokko",    goalsA: 2, goalsB: 1, winner: "Kroatien" },
    { phase: "final", teamA: "Argentinien", teamB: "Frankreich", goalsA: 3, goalsB: 3, winner: "Argentinien" }, // 4-2 i.E.
  ],
  champion: "Argentinien",
  runnerUp: "Frankreich",
  semiFinalists: ["Kroatien", "Marokko"],
};
