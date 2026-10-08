/** @jest-environment node */
import { budgetStatuses } from "./budget-status";
import { makeTransaction } from "./test-transactions";

describe("budgetStatuses", () => {
  it("calcula gasto e restante dentro do limite", () => {
    const [status] = budgetStatuses(
      [{ category: "Lazer", limitCents: 40_000 }],
      [makeTransaction({ category: "Lazer", amountCents: 10_000 })],
    );
    expect(status).toEqual({
      category: "Lazer",
      limitCents: 40_000,
      spentCents: 10_000,
      remainingCents: 30_000,
      isOverLimit: false,
    });
  });

  it("considera gasto zero quando a categoria não tem despesas no mês", () => {
    const [status] = budgetStatuses([{ category: "Saúde", limitCents: 5_000 }], []);
    expect(status.spentCents).toBe(0);
    expect(status.isOverLimit).toBe(false);
  });

  it("não marca estouro quando o gasto é exatamente o limite", () => {
    const [status] = budgetStatuses(
      [{ category: "Lazer", limitCents: 10_000 }],
      [makeTransaction({ category: "Lazer", amountCents: 10_000 })],
    );
    expect(status.remainingCents).toBe(0);
    expect(status.isOverLimit).toBe(false);
  });

  it("marca estouro e restante negativo acima do limite", () => {
    const [status] = budgetStatuses(
      [{ category: "Lazer", limitCents: 40_000 }],
      [makeTransaction({ category: "Lazer", amountCents: 45_000 })],
    );
    expect(status.remainingCents).toBe(-5_000);
    expect(status.isOverLimit).toBe(true);
  });

  it("ignora receitas da mesma categoria", () => {
    const [status] = budgetStatuses(
      [{ category: "Outros", limitCents: 1_000 }],
      [makeTransaction({ kind: "income", category: "Outros", amountCents: 5_000 })],
    );
    expect(status.spentCents).toBe(0);
  });
});
