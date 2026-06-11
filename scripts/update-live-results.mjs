// @ts-check
/**
 * Holt aktuelle WM-2026-Match-Ergebnisse von football-data.org und schreibt
 * sie nach `frontend/lib/data/liveResults.ts`.
 *
 * Aufruf:
 *   FOOTBALL_DATA_TOKEN=xxx node scripts/update-live-results.mjs
 *
 * Wird nicht mehr aktiv, wenn das aktuelle Datum nach WM_FINALE_DATE liegt.
 * Exit-Codes:
 *   0  alles ok (auch nach Finale)
 *   1  API-Fehler / fehlende Konfiguration
 *   2  Schedule-Match nicht zuordenbar (Daten-Inkonsistenz)
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const LIVE_RESULTS_PATH = path.join(
  REPO_ROOT,
  "frontend/lib/data/liveResults.ts",
);

// Nach diesem Datum macht der Workflow nichts mehr.
const WM_FINALE_DATE = new Date("2026-07-20T00:00:00Z");

// football-data.org Competition-Code für die WM 2026
const COMP_CODE = process.env.FOOTBALL_DATA_COMP ?? "WC";

const API_URL = `https://api.football-data.org/v4/competitions/${COMP_CODE}/matches`;

function logInfo(msg) {
  console.log(`ℹ️  ${msg}`);
}
function logWarn(msg) {
  console.warn(`⚠️  ${msg}`);
}
function logErr(msg) {
  console.error(`❌ ${msg}`);
}

async function main() {
  const now = new Date();
  if (now > WM_FINALE_DATE) {
    logInfo(
      `Heute (${now.toISOString().slice(0, 10)}) liegt nach dem WM-Finale (20.07.2026). Workflow exit-ed ohne API-Call.`,
    );
    process.exit(0);
  }

  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) {
    logErr("FOOTBALL_DATA_TOKEN nicht gesetzt. Bitte als GitHub-Secret pflegen.");
    process.exit(1);
  }

  logInfo(`Hole Matches von ${API_URL} ...`);
  const apiResponse = await fetch(API_URL, {
    headers: { "X-Auth-Token": token },
  });
  if (!apiResponse.ok) {
    logErr(`API antwortet mit ${apiResponse.status}: ${apiResponse.statusText}`);
    process.exit(1);
  }
  const apiData = await apiResponse.json();
  if (!Array.isArray(apiData.matches)) {
    logErr("API-Response enthält kein matches-Array.");
    process.exit(1);
  }
  logInfo(`${apiData.matches.length} Matches aus API gelesen.`);

  // Lade unseren Schedule, um die richtige Index-Zuordnung zu treffen
  const schedule = await loadSchedule();
  if (schedule.length === 0) {
    logErr("Schedule konnte nicht geladen werden.");
    process.exit(1);
  }

  // Map: "TeamA|TeamB" → matchIdx
  const scheduleByPair = new Map();
  for (let i = 0; i < schedule.length; i++) {
    const m = schedule[i];
    scheduleByPair.set(matchKey(m.teamA, m.teamB), i);
    // Zweite Richtung — falls die API die Reihenfolge anders hat:
    scheduleByPair.set(matchKey(m.teamB, m.teamA), -i - 1);
  }

  const liveResults = {};
  let matched = 0;
  let mismatched = 0;
  let finished = 0;

  for (const apiMatch of apiData.matches) {
    const teamA = mapTeamName(apiMatch.homeTeam?.name);
    const teamB = mapTeamName(apiMatch.awayTeam?.name);
    if (!teamA || !teamB) continue;

    const rawIdx = scheduleByPair.get(matchKey(teamA, teamB));
    if (rawIdx === undefined) {
      mismatched++;
      logWarn(
        `Kein Schedule-Treffer für ${teamA} vs ${teamB} (status=${apiMatch.status}).`,
      );
      continue;
    }
    const flipped = rawIdx < 0;
    const matchIdx = flipped ? -rawIdx - 1 : rawIdx;
    matched++;

    const goalsHome = apiMatch.score?.fullTime?.home ?? 0;
    const goalsAway = apiMatch.score?.fullTime?.away ?? 0;
    const isFinished =
      apiMatch.status === "FINISHED" || apiMatch.status === "AWARDED";

    if (!isFinished && apiMatch.status !== "IN_PLAY") continue;

    // Stell die Tore so um, dass A/B unserer Schedule-Reihenfolge entsprechen
    const goalsA = flipped ? goalsAway : goalsHome;
    const goalsB = flipped ? goalsHome : goalsAway;

    const entry = {
      goalsA,
      goalsB,
      isFinished,
    };

    // Elfmeterschießen
    const pen = apiMatch.score?.penalties;
    if (pen && (pen.home != null || pen.away != null)) {
      const penA = flipped ? pen.away : pen.home;
      const penB = flipped ? pen.home : pen.away;
      entry.penaltiesA = penA ?? 0;
      entry.penaltiesB = penB ?? 0;
      if (penA > penB) entry.winnerByPenalties = "A";
      else if (penB > penA) entry.winnerByPenalties = "B";
    }
    liveResults[matchIdx] = entry;
    if (isFinished) finished++;
  }

  logInfo(
    `Zuordnung: ${matched} gefunden, ${mismatched} nicht zuordenbar, ${finished} abgeschlossen.`,
  );

  await writeLiveResultsFile(liveResults);
  logInfo(`Aktualisiert: ${path.relative(REPO_ROOT, LIVE_RESULTS_PATH)}`);
}

function matchKey(a, b) {
  return `${a.toLowerCase()}|${b.toLowerCase()}`;
}

/** Mappt API-Team-Namen auf unsere Schedule-Namen. */
const TEAM_NAME_MAP = {
  // football-data.org → unser Name
  "Côte d'Ivoire": "Elfenbeink.",
  "Ivory Coast": "Elfenbeink.",
  "DR Congo": "DR Kongo",
  "Korea Republic": "Südkorea",
  "South Korea": "Südkorea",
  Germany: "Deutschland",
  Spain: "Spanien",
  France: "Frankreich",
  England: "England",
  Brazil: "Brasilien",
  Argentina: "Argentinien",
  Portugal: "Portugal",
  Netherlands: "Niederlande",
  Belgium: "Belgien",
  Croatia: "Kroatien",
  Mexico: "Mexiko",
  "South Africa": "Südafrika",
  "Czech Republic": "Tschechien",
  Czechia: "Tschechien",
  Canada: "Kanada",
  "Bosnia and Herzegovina": "Bosnien",
  Switzerland: "Schweiz",
  Qatar: "Katar",
  Morocco: "Marokko",
  Haiti: "Haiti",
  Scotland: "Schottland",
  Paraguay: "Paraguay",
  Australia: "Australien",
  Turkey: "Türkei",
  Türkiye: "Türkei",
  Ecuador: "Ecuador",
  Curaçao: "Curaçao",
  Japan: "Japan",
  Sweden: "Schweden",
  Tunisia: "Tunesien",
  Egypt: "Ägypten",
  Iran: "Iran",
  "New Zealand": "Neuseeland",
  "Cape Verde": "Kap Verde",
  "Saudi Arabia": "Saudi-Arabien",
  Uruguay: "Uruguay",
  Senegal: "Senegal",
  Iraq: "Irak",
  Norway: "Norwegen",
  Algeria: "Algerien",
  Austria: "Österreich",
  Jordan: "Jordanien",
  Uzbekistan: "Usbekistan",
  Colombia: "Kolumbien",
  Ghana: "Ghana",
  Panama: "Panama",
};
function mapTeamName(name) {
  if (!name) return null;
  if (TEAM_NAME_MAP[name]) return TEAM_NAME_MAP[name];
  return name; // Pass-through wenn schon der lokale Name
}

async function loadSchedule() {
  const schedulePath = path.join(REPO_ROOT, "frontend/lib/data/schedule.ts");
  const content = await readFile(schedulePath, "utf8");
  // Sehr simpler Parser: extrahiere Match-Einträge per RegEx
  const matches = [];
  const pattern = /teamA:\s*"([^"]+)"\s*,\s*teamB:\s*"([^"]+)"/g;
  for (const m of content.matchAll(pattern)) {
    matches.push({ teamA: m[1], teamB: m[2] });
  }
  return matches;
}

async function writeLiveResultsFile(liveResults) {
  const lines = [];
  lines.push("/**");
  lines.push(" * AUTO-GENERIERT von scripts/update-live-results.mjs.");
  lines.push(" * NICHT von Hand editieren — der nächste Workflow-Lauf überschreibt das.");
  lines.push(" */");
  lines.push("");
  lines.push("export interface LiveMatchResult {");
  lines.push("  goalsA: number;");
  lines.push("  goalsB: number;");
  lines.push("  isFinished: boolean;");
  lines.push("  kickoff?: string;");
  lines.push("  penaltiesA?: number;");
  lines.push("  penaltiesB?: number;");
  lines.push("  winnerByPenalties?: \"A\" | \"B\";");
  lines.push("}");
  lines.push("");
  lines.push("export const LIVE_RESULTS: Record<number, LiveMatchResult> = {");
  const sortedKeys = Object.keys(liveResults)
    .map(Number)
    .sort((a, b) => a - b);
  for (const k of sortedKeys) {
    const r = liveResults[k];
    const parts = [
      `goalsA: ${r.goalsA}`,
      `goalsB: ${r.goalsB}`,
      `isFinished: ${r.isFinished}`,
    ];
    if (r.penaltiesA !== undefined) parts.push(`penaltiesA: ${r.penaltiesA}`);
    if (r.penaltiesB !== undefined) parts.push(`penaltiesB: ${r.penaltiesB}`);
    if (r.winnerByPenalties) parts.push(`winnerByPenalties: "${r.winnerByPenalties}"`);
    lines.push(`  ${k}: { ${parts.join(", ")} },`);
  }
  lines.push("};");
  lines.push("");
  lines.push(
    `export const LIVE_RESULTS_UPDATED_AT: string | null = "${new Date().toISOString()}";`,
  );
  lines.push("");
  await writeFile(LIVE_RESULTS_PATH, lines.join("\n"), "utf8");
}

main().catch((err) => {
  logErr(err.stack || err.message);
  process.exit(1);
});
