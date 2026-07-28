/**
 * Konservierter Endstand der WM 2026.
 *
 * Diese Datei wird EINMALIG vom Workflow "Freeze Final Snapshot"
 * (.github/workflows/freeze-snapshot.yml) generiert, nachdem das Turnier
 * beendet ist. Sie friert alle Gruppen-Ergebnisse + K.o.-Spiele ein,
 * damit die App dauerhaft funktioniert, auch wenn ESPN die 2026-Daten
 * irgendwann aus dem Scoreboard-Feed entfernt.
 *
 * Solange `final === false` ist, verhält sich die App wie bisher
 * (Live-Polling gegen ESPN alle 2 Minuten). Nach dem Freeze:
 *   - Store wird mit den konservierten Daten initialisiert
 *   - ESPN-Polling wird komplett übersprungen
 *   - Matches-Tab zeigt ein "Turnier beendet"-Banner statt Live-Status
 */
import type { LiveMatchState } from "@/espn";
import type { LiveKoMatch } from "@lib/algorithms/koRounds";

export interface FinalSnapshot {
  /** true = Endstand eingebacken, App pollt nicht mehr */
  final: boolean;
  /** ISO-Zeitstempel des Freeze-Laufs */
  frozenAt: string | null;
  /** Gruppen-Ergebnisse: SCHEDULE-Index → Endstand */
  results: Record<number, LiveMatchState>;
  /** Alle K.o.-Spiele (R32 → Finale) in Kickoff-Reihenfolge */
  ko: LiveKoMatch[];
}

export const FINAL_SNAPSHOT: FinalSnapshot = {
  final: false,
  frozenAt: null,
  results: {},
  ko: [],
};
