/** @jest-environment node */
import { centsToInputValue, formatCents } from "./money";

const NBSP = " ";

describe("formatCents", () => {
  it("formata centavos em reais no padrão pt-BR", () => {
    expect(formatCents(123_456)).toBe(`R$${NBSP}1.234,56`);
    expect(formatCents(0)).toBe(`R$${NBSP}0,00`);
  });

  it("formata valores negativos", () => {
    expect(formatCents(-15_000)).toBe(`-R$${NBSP}150,00`);
  });
});

describe("centsToInputValue", () => {
  it("gera o valor com ponto e duas casas para <input type=number>", () => {
    expect(centsToInputValue(123_450)).toBe("1234.50");
    expect(centsToInputValue(5)).toBe("0.05");
  });
});
