/** Map team name → decimal odds for tournament winner */
export type MarktQuoten = Record<string, number>;

export interface OddsMeta {
  stand: string;
  quellen: string[];
}
