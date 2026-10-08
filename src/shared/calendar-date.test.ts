/** @jest-environment node */
import {
  formatIsoDate,
  formatIsoMonth,
  isIsoCalendarDate,
  parseIsoDate,
  parseIsoMonth,
  shiftIsoMonth,
} from "./calendar-date";

describe("isIsoCalendarDate", () => {
  it.each(["2026-10-08", "2024-02-29", "2026-12-31"])("aceita %s", (value) => {
    expect(isIsoCalendarDate(value)).toBe(true);
  });

  it.each(["2026-02-30", "2025-02-29", "2026-13-01", "2026-00-10", "08/10/2026", "2026-10-8", "2026-10-08x", ""])(
    "rejeita %p",
    (value) => {
      expect(isIsoCalendarDate(value)).toBe(false);
    },
  );
});

describe("parseIsoDate e formatIsoDate", () => {
  it("interpretam a data no horário local, sem deslocar o dia", () => {
    const date = parseIsoDate("2026-10-08");
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([
      2026, 9, 8, 0,
    ]);
    expect(formatIsoDate(date)).toBe("2026-10-08");
  });
});

describe("parseIsoMonth e formatIsoMonth", () => {
  it("usam o dia 1º do mês", () => {
    const date = parseIsoMonth("2026-03");
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 2, 1]);
    expect(formatIsoMonth(new Date(2026, 0, 31))).toBe("2026-01");
  });
});

describe("shiftIsoMonth", () => {
  it("avança, recua e atravessa anos", () => {
    expect(shiftIsoMonth("2026-10", 1)).toBe("2026-11");
    expect(shiftIsoMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftIsoMonth("2027-01", -1)).toBe("2026-12");
    expect(shiftIsoMonth("2026-06", -18)).toBe("2024-12");
  });
});
