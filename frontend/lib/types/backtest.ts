/**
 * Snapshot eines Teams VOR Turnierbeginn.
 *
 * Werte sind Annäherungen (Demo-Daten für Pipeline-Validierung).
 * Spätere Verfeinerung via echter Datenquellen ist offen.
 */
export interface HistoricalTeam {
  name: string;
  flag: string;
  /** Pre-Turnier-Wert dieses Faktors */
  elo: number;
  fifa: number;
  markt: number;
  form: number;
  heim: number;
  wmHF: number;
  trainer: number;
  star: number;
  hoehe: number;
}

export type HistoricalPhase =
  | "group"
  | "r16"
  | "qf"
  | "sf"
  | "3rd"
  | "final";

export interface HistoricalMatch {
  phase: HistoricalPhase;
  teamA: string;
  teamB: string;
  goalsA: number;
  goalsB: number;
  /**
   * Bei K.o.-Spielen: der tatsächliche Sieger nach Verlängerung / Elfmeter.
   * Bei Gruppenspielen: undefined (Tore sind ausreichend).
   */
  winner?: string;
}

export interface HistoricalTournament {
  year: number;
  host: string;
  teams: HistoricalTeam[];
  matches: HistoricalMatch[];
  champion: string;
  runnerUp: string;
  semiFinalists: [string, string]; // die 2 verlorenen HFler
}
