import type { HistoricalTournament } from "@/lib/types/backtest";
import { WM_2014 } from "./wm2014";
import { WM_2018 } from "./wm2018";
import { WM_2022 } from "./wm2022";

export const HISTORICAL_TOURNAMENTS: Record<number, HistoricalTournament> = {
  2014: WM_2014,
  2018: WM_2018,
  2022: WM_2022,
};

export const HISTORICAL_YEARS = [2014, 2018, 2022] as const;
export type HistoricalYear = (typeof HISTORICAL_YEARS)[number];

export { WM_2014, WM_2018, WM_2022 };
