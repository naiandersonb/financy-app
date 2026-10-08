/** @jest-environment node */
import { formatDayLabel, formatMonthLabel } from "./date";

describe("formatMonthLabel", () => {
  it("escreve o mês por extenso com inicial maiúscula", () => {
    expect(formatMonthLabel("2026-10")).toBe("Outubro de 2026");
    expect(formatMonthLabel("2027-01")).toBe("Janeiro de 2027");
  });
});

describe("formatDayLabel", () => {
  it("mostra dia e mês abreviado sem deslocar o dia pelo fuso", () => {
    expect(formatDayLabel("2026-10-08")).toBe("08 de out");
    expect(formatDayLabel("2026-01-01")).toBe("01 de jan");
  });
});
