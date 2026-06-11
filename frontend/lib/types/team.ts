export type GroupName =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L";

export interface Team {
  name: string;
  flag: string;
  group: GroupName;
  rang: number; // FIFA-Weltrang-Position (für Anzeige)
  elo: number;
  fifa: number;
  markt: number; // Mio. EUR Kaderwert
  form: number; // 0..1
  heim: number; // 0 oder 1 (Heimnation der WM 2026)
  wmHF: number; // historische WM-Halbfinale (0..n)
  trainer: number; // 1..10
  star: number; // Mio. EUR Top-Star
  hoehe: number; // -0.05..+0.10 Klima-/Höhen-Anpassung
}
