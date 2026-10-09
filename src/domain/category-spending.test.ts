/** @jest-environment node */
import { spendingByCategory } from "./category-spending";
import { makeTransaction } from "./testing/make-transaction";

describe("spendingByCategory", () => {
  it("retorna lista vazia sem despesas", () => {
    expect(spendingByCategory([makeTransaction({ kind: "income" })])).toEqual([]);
  });

  it("agrupa despesas por categoria, ordena pelo maior gasto e calcula a fatia", () => {
    const spending = spendingByCategory([
      makeTransaction({ categoryId: "cat-lazer", amountCents: 10_000 }),
      makeTransaction({ categoryId: "cat-alimentacao", amountCents: 20_000 }),
      makeTransaction({ categoryId: "cat-alimentacao", amountCents: 10_000 }),
      makeTransaction({ kind: "income", categoryId: "cat-salario", amountCents: 999_999 }),
    ]);
    expect(spending).toEqual([
      { categoryId: "cat-alimentacao", spentCents: 30_000, shareOfExpenses: 0.75 },
      { categoryId: "cat-lazer", spentCents: 10_000, shareOfExpenses: 0.25 },
    ]);
  });
});
