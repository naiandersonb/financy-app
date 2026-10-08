/** @jest-environment node */
import { summarizeMonth } from "./month-summary";
import { makeTransaction } from "./test-transactions";

describe("summarizeMonth", () => {
  it("retorna zeros para um mês sem lançamentos", () => {
    expect(summarizeMonth([])).toEqual({ incomeCents: 0, expenseCents: 0, balanceCents: 0 });
  });

  it("soma receitas e despesas e calcula o saldo", () => {
    const summary = summarizeMonth([
      makeTransaction({ kind: "income", amountCents: 500_000 }),
      makeTransaction({ kind: "expense", amountCents: 300_000 }),
      makeTransaction({ kind: "expense", amountCents: 20_050 }),
    ]);
    expect(summary).toEqual({
      incomeCents: 500_000,
      expenseCents: 320_050,
      balanceCents: 179_950,
    });
  });

  it("permite saldo negativo", () => {
    const summary = summarizeMonth([
      makeTransaction({ kind: "income", amountCents: 100 }),
      makeTransaction({ kind: "expense", amountCents: 250 }),
    ]);
    expect(summary.balanceCents).toBe(-150);
  });
});
