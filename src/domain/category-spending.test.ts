/** @jest-environment node */
import { spendingByCategory } from "./category-spending";
import { makeTransaction } from "./test-transactions";

describe("spendingByCategory", () => {
  it("retorna lista vazia sem despesas", () => {
    expect(spendingByCategory([makeTransaction({ kind: "income" })])).toEqual([]);
  });

  it("agrupa despesas por categoria, ordena pelo maior gasto e calcula a fatia", () => {
    const spending = spendingByCategory([
      makeTransaction({ category: "Lazer", amountCents: 10_000 }),
      makeTransaction({ category: "Alimentação", amountCents: 20_000 }),
      makeTransaction({ category: "Alimentação", amountCents: 10_000 }),
      makeTransaction({ kind: "income", category: "Salário", amountCents: 999_999 }),
    ]);
    expect(spending).toEqual([
      { category: "Alimentação", spentCents: 30_000, shareOfExpenses: 0.75 },
      { category: "Lazer", spentCents: 10_000, shareOfExpenses: 0.25 },
    ]);
  });
});
