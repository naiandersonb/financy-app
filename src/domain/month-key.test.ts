/** @jest-environment node */
import {
  currentMonthKey,
  defaultDateInMonth,
  monthDateRange,
  parseMonthKey,
  shiftMonth,
  splitMonthKey,
} from "./month-key";

describe("currentMonthKey", () => {
  it("usa o mês da data informada, com zero à esquerda", () => {
    expect(currentMonthKey(new Date(2026, 0, 31))).toBe("2026-01");
    expect(currentMonthKey(new Date(2026, 9, 8))).toBe("2026-10");
  });
});

describe("parseMonthKey", () => {
  it.each(["2026-01", "2026-12", "1999-07"])("aceita %s", (value) => {
    expect(parseMonthKey(value)).toBe(value);
  });

  it.each(["2026-13", "2026-00", "2026-1", "abc", "", "2026-10-01"])("rejeita %p", (value) => {
    expect(parseMonthKey(value)).toBeNull();
  });

  it("rejeita ausência e listas de valores", () => {
    expect(parseMonthKey(undefined)).toBeNull();
    expect(parseMonthKey(["2026-10"])).toBeNull();
  });
});

describe("shiftMonth", () => {
  it("avança e recua dentro do ano", () => {
    expect(shiftMonth("2026-10", 1)).toBe("2026-11");
    expect(shiftMonth("2026-10", -1)).toBe("2026-09");
  });

  it("vira o ano nos dois sentidos", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2027-01", -1)).toBe("2026-12");
    expect(shiftMonth("2026-06", -18)).toBe("2024-12");
  });
});

describe("monthDateRange", () => {
  it("vai do dia 1º até o primeiro dia do mês seguinte (exclusivo)", () => {
    expect(monthDateRange("2026-02")).toEqual({
      start: "2026-02-01",
      endExclusive: "2026-03-01",
    });
  });

  it("atravessa a virada de ano", () => {
    expect(monthDateRange("2026-12")).toEqual({
      start: "2026-12-01",
      endExclusive: "2027-01-01",
    });
  });
});

describe("defaultDateInMonth", () => {
  const now = new Date(2026, 9, 8);

  it("usa hoje quando o mês exibido é o atual", () => {
    expect(defaultDateInMonth("2026-10", now)).toBe("2026-10-08");
  });

  it("usa o dia 1º quando o mês exibido é outro", () => {
    expect(defaultDateInMonth("2026-09", now)).toBe("2026-09-01");
    expect(defaultDateInMonth("2027-10", now)).toBe("2027-10-01");
  });
});

describe("splitMonthKey", () => {
  it("separa ano e mês como números", () => {
    expect(splitMonthKey("2026-03")).toEqual([2026, 3]);
  });
});
