#!/usr/bin/env node
/**
 * Freeze Final Snapshot — konserviert den WM-2026-Endstand.
 *
 * Holt den kompletten Turnier-Feed von ESPN und generiert
 * `singlefile/src/data/finalSnapshot.ts` mit allen Gruppen-Ergebnissen
 * und K.o.-Spielen. Danach ist die App unabhängig von ESPN.
 *
 * Läuft in GitHub Actions (dort ist ESPN erreichbar) — siehe
 * .github/workflows/freeze-snapshot.yml. Bewusst dependency-frei
 * (nur Node-Builtins), damit kein npm install nötig ist.
 *
 * Die Team-Namens-Map und die Runden-Klassifikation sind Kopien aus
 * singlefile/src/espn.ts bzw. frontend/lib/algorithms/koRounds.ts —
 * bei Änderungen dort bitte hier nachziehen. Der Gruppen-Spielplan wird
 * NICHT dupliziert, sondern aus frontend/lib/data/schedule.ts geparst
 * (Single Source of Truth).
 *
 * Strikte Vollständigkeits-Checks: bricht ab, wenn nicht alle 72
 * Gruppenspiele und 32 K.o.-Spiele als beendet im Feed stehen — ein
 * partieller Freeze wäre schlechter als weiter live zu pollen.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?limit=950&dates=20260611-20260719";

// Kopie aus singlefile/src/espn.ts (ESPN-Englisch → deutsche Team-Keys)
const ESPN_NAME_MAP = {
  Mexico: "Mexiko", "South Africa": "Südafrika", Tunisia: "Tunesien",
  "Saudi Arabia": "Saudi-Arabien", Switzerland: "Schweiz", Canada: "Kanada",
  "Bosnia and Herzegovina": "Bosnien", "Bosnia-Herzegovina": "Bosnien",
  Czechia: "Tschechien", "Czech Republic": "Tschechien", Brazil: "Brasilien",
  Morocco: "Marokko", Haiti: "Haiti", Scotland: "Schottland", USA: "USA",
  "United States": "USA", Paraguay: "Paraguay", "Türkiye": "Türkei",
  Turkey: "Türkei", Australia: "Australien", Germany: "Deutschland",
  "Curaçao": "Curaçao", Curacao: "Curaçao", "Ivory Coast": "Elfenbeink.",
  "Côte d'Ivoire": "Elfenbeink.", "Cote d'Ivoire": "Elfenbeink.",
  Ecuador: "Ecuador", Netherlands: "Niederlande", Japan: "Japan",
  Iran: "Iran", "New Zealand": "Neuseeland", Spain: "Spanien",
  "Cape Verde": "Kap Verde", "Cabo Verde": "Kap Verde", Belgium: "Belgien",
  Egypt: "Ägypten", Uruguay: "Uruguay", France: "Frankreich",
  Senegal: "Senegal", Iraq: "Irak", Norway: "Norwegen",
  Argentina: "Argentinien", Algeria: "Algerien", Austria: "Österreich",
  Jordan: "Jordanien", Portugal: "Portugal", "DR Congo": "DR Kongo",
  "Congo DR": "DR Kongo", "Democratic Republic of the Congo": "DR Kongo",
  England: "England", Croatia: "Kroatien", Uzbekistan: "Usbekistan",
  Colombia: "Kolumbien", "South Korea": "Südkorea",
  "Korea Republic": "Südkorea", Ghana: "Ghana", Panama: "Panama",
  Sweden: "Schweden", Qatar: "Katar",
};

const mapName = (s) => (s ? (ESPN_NAME_MAP[s] ?? s) : "");

// Kopie aus frontend/lib/algorithms/koRounds.ts (ET-Kalendertag-Fenster)
const ET_OFFSET_MS = 4 * 3600_000;
function classifyKoRound(ts) {
  const d = new Date(ts - ET_OFFSET_MS);
  const md = (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
  if (md < 628) return null;
  if (md <= 703) return "r32";
  if (md <= 708) return "r16";
  if (md <= 712) return "qf";
  if (md <= 716) return "sf";
  if (md <= 718) return "third";
  if (md === 719) return "final";
  return null;
}

// Gruppen-Spielplan aus der Source-of-Truth-Datei parsen (teamA/teamB
// pro Zeile, in Datei-Reihenfolge = SCHEDULE-Index)
function parseSchedule() {
  const src = readFileSync(
    join(ROOT, "frontend/lib/data/schedule.ts"),
    "utf8",
  );
  const re = /teamA:\s*"([^"]+)",\s*teamB:\s*"([^"]+)"/g;
  const pairs = [];
  for (const m of src.matchAll(re)) pairs.push({ teamA: m[1], teamB: m[2] });
  if (pairs.length !== 72) {
    throw new Error(`Spielplan-Parse fehlgeschlagen: ${pairs.length} statt 72 Einträge.`);
  }
  return pairs;
}

const schedule = parseSchedule();

console.log("Hole ESPN-Feed ...");
const resp = await fetch(ESPN_URL);
if (!resp.ok) throw new Error(`ESPN HTTP ${resp.status}`);
const data = await resp.json();
if (!data.events?.length) throw new Error("ESPN: keine Events im Feed.");
console.log(`${data.events.length} Events erhalten.`);

const results = {};
const ko = [];

for (const ev of data.events) {
  if (!ev.date || !ev.date.startsWith("2026")) continue;
  const comp = ev.competitions?.[0];
  if (!comp?.competitors || comp.competitors.length !== 2) continue;
  const home = comp.competitors.find((c) => c.homeAway === "home");
  const away = comp.competitors.find((c) => c.homeAway === "away");
  if (!home || !away) continue;

  const nameHome = mapName(home.team?.displayName);
  const nameAway = mapName(away.team?.displayName);
  const state = comp.status?.type?.state ?? "pre";
  const completed = comp.status?.type?.completed === true;
  const scoreHome = parseInt(home.score, 10) || 0;
  const scoreAway = parseInt(away.score, 10) || 0;
  const ts = Date.parse(ev.date);

  const round = Number.isFinite(ts) ? classifyKoRound(ts) : null;
  if (round) {
    if (!completed) continue; // Freeze konserviert nur Endstände
    const penHome = home.shootoutScore != null ? parseInt(home.shootoutScore, 10) : undefined;
    const penAway = away.shootoutScore != null ? parseInt(away.shootoutScore, 10) : undefined;
    let winner;
    if (home.winner === true) winner = "A";
    else if (away.winner === true) winner = "B";
    else if (scoreHome !== scoreAway) winner = scoreHome > scoreAway ? "A" : "B";
    else if (penHome != null && penAway != null && penHome !== penAway) {
      winner = penHome > penAway ? "A" : "B";
    }
    ko.push({
      round, ts, teamA: nameHome, teamB: nameAway,
      scoreA: scoreHome, scoreB: scoreAway,
      state: "post", clock: "", completed: true,
      ...(Number.isFinite(penHome) ? { penA: penHome } : {}),
      ...(Number.isFinite(penAway) ? { penB: penAway } : {}),
      ...(winner ? { winner } : {}),
      venue: comp.venue?.fullName ?? "",
    });
    continue;
  }

  if (!completed) continue;
  const idx = schedule.findIndex(
    (m) =>
      (m.teamA === nameHome && m.teamB === nameAway) ||
      (m.teamA === nameAway && m.teamB === nameHome),
  );
  if (idx === -1) {
    console.warn(`⚠️ Kein SCHEDULE-Match für: ${nameHome} vs ${nameAway}`);
    continue;
  }
  const flipped = schedule[idx].teamA === nameAway;
  results[idx] = {
    scoreA: flipped ? scoreAway : scoreHome,
    scoreB: flipped ? scoreHome : scoreAway,
    state: "post",
    clock: "",
    completed: true,
  };
}

ko.sort((a, b) => a.ts - b.ts);

const groupCount = Object.keys(results).length;
console.log(`Gruppen-Ergebnisse: ${groupCount}/72 · K.o.-Spiele: ${ko.length}/32`);
if (groupCount !== 72) {
  throw new Error(`Unvollständig: nur ${groupCount}/72 Gruppenspiele beendet im Feed. Freeze abgebrochen.`);
}
if (ko.length !== 32) {
  throw new Error(`Unvollständig: nur ${ko.length}/32 K.o.-Spiele beendet im Feed. Freeze abgebrochen.`);
}

const frozenAt = new Date().toISOString();
const out = `/**
 * Konservierter Endstand der WM 2026.
 *
 * AUTO-GENERIERT von scripts/freeze-final-snapshot.mjs am ${frozenAt}
 * — nicht von Hand editieren.
 *
 * final === true → App pollt ESPN nicht mehr, alle Tabellen/Brackets
 * speisen sich aus diesen eingebackenen Daten.
 */
import type { LiveMatchState } from "@/espn";
import type { LiveKoMatch } from "@lib/algorithms/koRounds";

export interface FinalSnapshot {
  final: boolean;
  frozenAt: string | null;
  results: Record<number, LiveMatchState>;
  ko: LiveKoMatch[];
}

export const FINAL_SNAPSHOT: FinalSnapshot = {
  final: true,
  frozenAt: ${JSON.stringify(frozenAt)},
  results: ${JSON.stringify(results, null, 2)},
  ko: ${JSON.stringify(ko, null, 2)},
};
`;

const target = join(ROOT, "singlefile/src/data/finalSnapshot.ts");
writeFileSync(target, out);
console.log(`✅ Snapshot geschrieben: ${target}`);
