import { describe, expect, it } from "vitest";
import { classifyKoRound } from "@/lib/algorithms/koRounds";

// Hilfe: UTC-Timestamp für ein Datum + Stunde
const utc = (month: number, day: number, hourUtc = 20) =>
  Date.UTC(2026, month - 1, day, hourUtc, 0, 0);

describe("classifyKoRound — Runden-Klassifikation nach ET-Kalendertag", () => {
  it("Gruppenphase (bis 27.06. ET) → null", () => {
    expect(classifyKoRound(utc(6, 11))).toBeNull();
    expect(classifyKoRound(utc(6, 27))).toBeNull();
    // 28.06. 01:00 UTC = 27.06. 21:00 ET → noch Gruppenphase
    expect(classifyKoRound(utc(6, 28, 1))).toBeNull();
  });

  it("R32: 28.06. – 03.07.", () => {
    expect(classifyKoRound(utc(6, 28))).toBe("r32");
    expect(classifyKoRound(utc(6, 29))).toBe("r32");
    expect(classifyKoRound(utc(7, 2))).toBe("r32");
    expect(classifyKoRound(utc(7, 3, 23))).toBe("r32");
    // 04.07. 02:00 UTC = 03.07. 22:00 ET → noch R32
    expect(classifyKoRound(utc(7, 4, 2))).toBe("r32");
  });

  it("R16: 04.07. – 08.07.", () => {
    expect(classifyKoRound(utc(7, 4, 18))).toBe("r16");
    expect(classifyKoRound(utc(7, 7))).toBe("r16");
    expect(classifyKoRound(utc(7, 8, 23))).toBe("r16");
  });

  it("QF: 09.07. – 12.07.", () => {
    expect(classifyKoRound(utc(7, 9, 18))).toBe("qf");
    expect(classifyKoRound(utc(7, 11))).toBe("qf");
  });

  it("SF: 13.07. – 16.07.", () => {
    expect(classifyKoRound(utc(7, 14))).toBe("sf");
    expect(classifyKoRound(utc(7, 15))).toBe("sf");
  });

  it("Spiel um Platz 3: 18.07.", () => {
    expect(classifyKoRound(utc(7, 18))).toBe("third");
  });

  it("Finale: 19.07.", () => {
    expect(classifyKoRound(utc(7, 19))).toBe("final");
    // 20.07. 00:30 UTC = 19.07. 20:30 ET → noch Finale
    expect(classifyKoRound(utc(7, 20, 0))).toBe("final");
  });

  it("nach dem Turnier → null", () => {
    expect(classifyKoRound(utc(7, 25))).toBeNull();
  });
});
