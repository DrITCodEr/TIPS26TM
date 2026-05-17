import type { GroupName } from "./team";

export interface Match {
  group: GroupName;
  date: string; // "Sa, 14.06."
  time: string; // "19:00" (MESZ)
  venue: string;
  teamA: string;
  teamB: string;
  /** wird beim Laden des Spielplans aufgelöst */
  idxA?: number;
  idxB?: number;
}
