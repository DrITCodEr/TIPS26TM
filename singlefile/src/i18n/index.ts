import { useStore } from "@/store";
import {
  DEFAULT_LOCALE,
  type Locale,
  translations,
  type TranslationDict,
} from "./translations";

export { LOCALES, LOCALE_LABEL, LOCALE_FLAG, DEFAULT_LOCALE } from "./translations";
export type { Locale, TranslationDict };

const LS_KEY = "tips26:locale";

export function loadStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(LS_KEY);
    if (v === "de" || v === "en") return v;
  } catch {
    // ignore
  }
  return null;
}

export function storeLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, locale);
  } catch {
    // ignore
  }
}

/**
 * Hook zur Übersetzung. Liefert das aktive TranslationDict + Locale +
 * `teamName(internalKey)` für das Display-Team-Name-Mapping.
 *
 * Verwendung:
 *   const { t, locale, teamName } = useT();
 *   <h2>{t.nav.home}</h2>
 *   <span>{teamName("Deutschland")}</span>
 */
export function useT() {
  const locale = useStore((s) => s.locale);
  const effective: Locale = locale ?? DEFAULT_LOCALE;
  const t = translations[effective];
  return {
    t,
    locale: effective,
    /** Anzeige-Name eines Teams (intern bleibt der deutsche Key). */
    teamName: (internalKey: string): string =>
      (t.teams as Record<string, string>)[internalKey] ?? internalKey,
  };
}

// ============================================================
// Datums-Formatter
// ============================================================

// Deutsche Wochentags-Kürzel → Englische Wochentags-Kürzel
const DAY_DE_TO_EN: Record<string, string> = {
  Mo: "Mon",
  Di: "Tue",
  Mi: "Wed",
  Do: "Thu",
  Fr: "Fri",
  Sa: "Sat",
  So: "Sun",
};

const MONTH_EN: Record<string, string> = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec",
};

/**
 * Formatiert die hardcodierten Datums-Strings aus dem Spielplan
 * ("Do, 11.06.") gemäß Locale. Englisch: "Thu, Jun 11".
 */
export function formatScheduleDate(raw: string, locale: Locale): string {
  if (locale === "de") return raw;
  // Parse "Do, 11.06."
  const m = raw.match(/^(\w{2}),\s*(\d{1,2})\.(\d{2})\.?$/);
  if (!m) return raw;
  const [, dayDe, dayNum, monthNum] = m;
  const dayEn = DAY_DE_TO_EN[dayDe] ?? dayDe;
  const monthEn = MONTH_EN[monthNum] ?? monthNum;
  return `${dayEn}, ${monthEn} ${dayNum}`;
}
