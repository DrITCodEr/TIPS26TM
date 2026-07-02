import { SCHEDULE } from "@lib/data/schedule";
import { classifyKoRound, type LiveKoMatch } from "@lib/algorithms/koRounds";

/**
 * ESPN Soccer-API: kostenlos, CORS-offen, kein Key — perfekt für Browser-
 * Direkt-Fetch. Liefert Match-Status pro Tag, gemappt auf unseren Spielplan.
 *
 * Gruppenphase: Events werden über Team-Namen auf den 72-Spiele-SCHEDULE
 * gemappt (Index-stabil). K.o.-Phase: die Paarungen stehen NICHT im
 * SCHEDULE — sie werden separat als `ko`-Liste zurückgegeben, inklusive
 * "pre"-Fixtures (angesetzte, noch nicht angepfiffene Spiele), damit der
 * Turnierbaum echte Paarungen zeigt statt sie fehleranfällig aus
 * Tabellenständen abzuleiten.
 *
 * Wenn die HTML lokal per Doppelklick geöffnet wird (file://), blockiert
 * der Browser den externen fetch — `IS_FILE_CONTEXT` erkennt das und
 * setzt einen sprechenden Fehler.
 */

export interface LiveMatchState {
  scoreA: number;
  scoreB: number;
  /** ESPN-Status: "in" = läuft, "post" = abgepfiffen */
  state: "in" | "post";
  /** ESPN-Spieluhr (z.B. "67'") */
  clock: string;
  completed: boolean;
}

export interface LiveFetchResult {
  results: Record<number, LiveMatchState>;
  /** K.o.-Spiele (R32 → Finale) in Kickoff-Reihenfolge, inkl. Vorschau-Fixtures */
  ko: LiveKoMatch[];
  fetchedAt: Date;
}

export type { LiveKoMatch };

export const IS_FILE_CONTEXT =
  typeof location !== "undefined" &&
  !["http:", "https:"].includes(location.protocol);

const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?limit=950&dates=20260611-20260719";

// ESPN-Englisch → unsere deutschen Namen
const ESPN_NAME_MAP: Record<string, string> = {
  Mexico: "Mexiko",
  "South Africa": "Südafrika",
  Tunisia: "Tunesien",
  "Saudi Arabia": "Saudi-Arabien",
  Switzerland: "Schweiz",
  Canada: "Kanada",
  "Bosnia and Herzegovina": "Bosnien",
  "Bosnia-Herzegovina": "Bosnien",
  Czechia: "Tschechien",
  "Czech Republic": "Tschechien",
  Brazil: "Brasilien",
  Morocco: "Marokko",
  Haiti: "Haiti",
  Scotland: "Schottland",
  USA: "USA",
  "United States": "USA",
  Paraguay: "Paraguay",
  Türkiye: "Türkei",
  Turkey: "Türkei",
  Australia: "Australien",
  Germany: "Deutschland",
  Curaçao: "Curaçao",
  Curacao: "Curaçao",
  "Ivory Coast": "Elfenbeink.",
  "Côte d'Ivoire": "Elfenbeink.",
  "Cote d'Ivoire": "Elfenbeink.",
  Ecuador: "Ecuador",
  Netherlands: "Niederlande",
  Japan: "Japan",
  Iran: "Iran",
  "New Zealand": "Neuseeland",
  Spain: "Spanien",
  "Cape Verde": "Kap Verde",
  "Cabo Verde": "Kap Verde",
  Belgium: "Belgien",
  Egypt: "Ägypten",
  Uruguay: "Uruguay",
  France: "Frankreich",
  Senegal: "Senegal",
  Iraq: "Irak",
  Norway: "Norwegen",
  Argentina: "Argentinien",
  Algeria: "Algerien",
  Austria: "Österreich",
  Jordan: "Jordanien",
  Portugal: "Portugal",
  "DR Congo": "DR Kongo",
  "Congo DR": "DR Kongo",
  "Democratic Republic of the Congo": "DR Kongo",
  England: "England",
  Croatia: "Kroatien",
  Uzbekistan: "Usbekistan",
  Colombia: "Kolumbien",
  "South Korea": "Südkorea",
  "Korea Republic": "Südkorea",
  Ghana: "Ghana",
  Panama: "Panama",
  Sweden: "Schweden",
  Qatar: "Katar",
};

function mapName(s: string | undefined): string {
  if (!s) return "";
  return ESPN_NAME_MAP[s] ?? s;
}

export async function fetchLiveFromEspn(): Promise<LiveFetchResult> {
  if (IS_FILE_CONTEXT) {
    throw new Error("file-context");
  }
  const resp = await fetch(ESPN_URL);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  if (!data.events || !data.events.length) throw new Error("keine Events");

  const results: Record<number, LiveMatchState> = {};
  const ko: LiveKoMatch[] = [];

  for (const ev of data.events as any[]) {
    if (!ev.date || !ev.date.startsWith("2026")) continue;
    const comp = ev.competitions?.[0];
    if (!comp?.competitors || comp.competitors.length !== 2) continue;
    const home = comp.competitors.find((c: any) => c.homeAway === "home");
    const away = comp.competitors.find((c: any) => c.homeAway === "away");
    if (!home || !away) continue;

    const nameHome = mapName(home.team?.displayName);
    const nameAway = mapName(away.team?.displayName);
    const state = comp.status?.type?.state ?? "pre";
    const completed = comp.status?.type?.completed === true;
    const scoreHome = parseInt(home.score, 10) || 0;
    const scoreAway = parseInt(away.score, 10) || 0;
    const ts = Date.parse(ev.date);

    // K.o.-Phase (ab 28.06. ET): NICHT im SCHEDULE — separat einsammeln,
    // inklusive "pre"-Fixtures für den Turnierbaum.
    const round = Number.isFinite(ts) ? classifyKoRound(ts) : null;
    if (round) {
      const penHome = home.shootoutScore != null ? parseInt(home.shootoutScore, 10) : undefined;
      const penAway = away.shootoutScore != null ? parseInt(away.shootoutScore, 10) : undefined;
      let winner: "A" | "B" | undefined;
      if (completed) {
        if (home.winner === true) winner = "A";
        else if (away.winner === true) winner = "B";
        else if (scoreHome !== scoreAway) winner = scoreHome > scoreAway ? "A" : "B";
        else if (penHome != null && penAway != null && penHome !== penAway) {
          winner = penHome > penAway ? "A" : "B";
        }
      }
      ko.push({
        round,
        ts,
        teamA: nameHome,
        teamB: nameAway,
        scoreA: scoreHome,
        scoreB: scoreAway,
        state: state === "post" ? "post" : state === "in" ? "in" : "pre",
        clock: comp.status?.displayClock ?? "",
        completed,
        penA: Number.isFinite(penHome) ? penHome : undefined,
        penB: Number.isFinite(penAway) ? penAway : undefined,
        winner,
        venue: comp.venue?.fullName ?? "",
      });
      continue;
    }

    // Gruppenphase: nur laufende/beendete Spiele, gemappt auf SCHEDULE-Index
    if (state === "pre") continue;

    const idx = SCHEDULE.findIndex(
      (m) =>
        (m.teamA === nameHome && m.teamB === nameAway) ||
        (m.teamA === nameAway && m.teamB === nameHome),
    );
    if (idx === -1) continue;

    const m = SCHEDULE[idx];
    const flipped = m.teamA === nameAway;

    results[idx] = {
      scoreA: flipped ? scoreAway : scoreHome,
      scoreB: flipped ? scoreHome : scoreAway,
      state: state === "post" ? "post" : "in",
      clock: comp.status?.displayClock ?? "",
      completed,
    };
  }
  ko.sort((a, b) => a.ts - b.ts);
  return { results, ko, fetchedAt: new Date() };
}
