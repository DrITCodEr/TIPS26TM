/**
 * Live-Ergebnisse pro WM-2026-Match.
 *
 * Schlüssel: Index in `SCHEDULE` aus `lib/data/schedule.ts`. Damit bleibt
 * die Zuordnung stabil, selbst wenn das Match-Datum sich ändert.
 *
 * Wird vom täglichen GitHub-Action-Workflow überschrieben (siehe
 * `scripts/update-live-results.ts` und `.github/workflows/daily-update.yml`).
 * Nach dem Finale am 19.07.2026 läuft der Workflow leer durch.
 *
 * Beim ersten Commit ist die Map leer — die App zeigt dann jeden Match
 * als "geplant" mit Anpfiff-Zeit + Stadion.
 */

export interface LiveMatchResult {
  /** Tore der im Spielplan zuerst genannten Mannschaft */
  goalsA: number;
  /** Tore der zweiten Mannschaft */
  goalsB: number;
  /** Ist das Match in der echten Welt schon abgepfiffen? */
  isFinished: boolean;
  /** Optional: ISO-Zeitstempel für Kickoff oder letzter Update */
  kickoff?: string;
  /** Bei K.o.-Spielen mit Elfmeterschießen */
  penaltiesA?: number;
  penaltiesB?: number;
  /** Wenn nach Elfmetern: Sieger explizit markieren */
  winnerByPenalties?: "A" | "B";
}

/** Index in SCHEDULE → echtes Ergebnis. */
export const LIVE_RESULTS: Record<number, LiveMatchResult> = {
  // Wird vom Auto-Update-Workflow gefüllt.
};

/** Zeitpunkt des letzten Workflow-Laufs. */
export const LIVE_RESULTS_UPDATED_AT: string | null = null;
