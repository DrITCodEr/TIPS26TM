/**
 * Klassifiziert einen Kickoff-Zeitstempel in die K.o.-Runde der WM 2026.
 *
 * Warum datum-basiert? Der ESPN-Scoreboard-Feed liefert kein verlässliches
 * Runden-Feld, aber der FIFA-Kalender hat feste, nicht überlappende
 * Rundenfenster (mit Ruhetagen dazwischen):
 *
 *   R32   28.06. – 03.07.
 *   R16   04.07. – 08.07.
 *   QF    09.07. – 12.07.
 *   SF    13.07. – 16.07.
 *   3rd   17.07. – 18.07.
 *   Final 19.07.
 *
 * Wir rechnen in US-Eastern-Time (UTC−4 im Sommer), weil die FIFA-Termine
 * in Lokalzeit geplant sind — ein 21:00-ET-Anpfiff am 03.07. ist bereits
 * der 04.07. in UTC und würde sonst falsch als R16 eingeordnet.
 */

export type KoRound = "r32" | "r16" | "qf" | "sf" | "third" | "final";

export interface LiveKoMatch {
  round: KoRound;
  /** Kickoff als Unix-Timestamp (ms) */
  ts: number;
  /** Team-Namen, auf unsere deutschen Keys gemappt (oder ESPN-Rohname bei Mapping-Lücke) */
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  state: "pre" | "in" | "post";
  clock: string;
  completed: boolean;
  /** Elfmeterschießen, falls vorhanden */
  penA?: number;
  penB?: number;
  /** Sieger nach 90/120 min oder Elfmeterschießen */
  winner?: "A" | "B";
  venue: string;
}

const ET_OFFSET_MS = 4 * 3600_000; // UTC-4 (Sommerzeit)

/** ET-Kalendertag als Zahl: Monat*100 + Tag (z.B. 628 = 28. Juni, 704 = 4. Juli). */
function etMonthDay(ts: number): number {
  const d = new Date(ts - ET_OFFSET_MS);
  return (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}

/**
 * K.o.-Runde für einen Kickoff-Zeitstempel — `null` für Gruppenphase
 * (vor dem 28.06. ET) oder Termine außerhalb des Turnierfensters.
 */
export function classifyKoRound(ts: number): KoRound | null {
  const md = etMonthDay(ts);
  if (md < 628) return null; // Gruppenphase
  if (md <= 703) return "r32";
  if (md <= 708) return "r16";
  if (md <= 712) return "qf";
  if (md <= 716) return "sf";
  if (md <= 718) return "third";
  if (md === 719) return "final";
  return null;
}
