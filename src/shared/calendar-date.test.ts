/** @jest-environment node */
import { isIsoCalendarDate } from "./calendar-date";

describe("isIsoCalendarDate", () => {
  it.each(["2026-10-08", "2024-02-29", "2026-12-31"])("aceita %s", (value) => {
    expect(isIsoCalendarDate(value)).toBe(true);
  });

  it.each(["2026-02-30", "2025-02-29", "2026-13-01", "2026-00-10", "08/10/2026", "2026-10-8", ""])(
    "rejeita %p",
    (value) => {
      expect(isIsoCalendarDate(value)).toBe(false);
    },
  );
});
