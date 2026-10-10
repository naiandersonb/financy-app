/** @jest-environment node */
import { makeTransaction } from "@/domain/testing/make-transaction";
import { HOUSING, LEISURE, SALARY } from "../testing/category-fixtures";
import { InMemoryBudgetRepository } from "../testing/in-memory-budget-repository";
import { InMemoryCategoryRepository } from "../testing/in-memory-category-repository";
import { InMemoryTransactionRepository } from "../testing/in-memory-transaction-repository";
import { getMonthOverview } from "./get-month-overview";

describe("getMonthOverview", () => {
  let transactions: InMemoryTransactionRepository;
  let categories: InMemoryCategoryRepository;
  let budgets: InMemoryBudgetRepository;

  beforeEach(() => {
    transactions = new InMemoryTransactionRepository();
    categories = new InMemoryCategoryRepository();
    categories.items.push(HOUSING, LEISURE, SALARY);
    budgets = new InMemoryBudgetRepository("user-1");
  });

  it("devolve lançamentos, totais e gastos por categoria só do mês, com as categorias do usuário", async () => {
    transactions.items.push(
      makeTransaction({ id: "set-30", kind: "income", amountCents: 999_999, occurredOn: "2026-09-30", categoryId: SALARY.id }),
      makeTransaction({ id: "salario", kind: "income", amountCents: 500_000, occurredOn: "2026-10-05", categoryId: SALARY.id }),
      makeTransaction({ id: "aluguel", kind: "expense", amountCents: 300_000, occurredOn: "2026-10-01", categoryId: HOUSING.id }),
      makeTransaction({ id: "cinema", kind: "expense", amountCents: 100_000, occurredOn: "2026-10-31", categoryId: LEISURE.id }),
      makeTransaction({ id: "nov-01", kind: "expense", amountCents: 999_999, occurredOn: "2026-11-01", categoryId: LEISURE.id }),
    );

    const overview = await getMonthOverview({ transactions, categories, budgets }, "2026-10");

    expect(overview.transactions.map((item) => item.id)).toEqual(["salario", "aluguel", "cinema"]);
    expect(overview.summary).toEqual({
      incomeCents: 500_000,
      expenseCents: 400_000,
      balanceCents: 100_000,
    });
    expect(overview.categories).toEqual([HOUSING, LEISURE, SALARY]);
    expect(overview.spending).toEqual([
      { categoryId: HOUSING.id, spentCents: 300_000, shareOfExpenses: 0.75 },
      { categoryId: LEISURE.id, spentCents: 100_000, shareOfExpenses: 0.25 },
    ]);
  });

  it("devolve a situação dos orçamentos calculada com os gastos do mês", async () => {
    await budgets.upsert("user-1", { categoryId: LEISURE.id, limitCents: 40_000 });
    transactions.items.push(
      makeTransaction({ kind: "expense", amountCents: 10_000, occurredOn: "2026-10-10", categoryId: LEISURE.id }),
      makeTransaction({ kind: "expense", amountCents: 99_999, occurredOn: "2026-09-10", categoryId: LEISURE.id }),
    );

    const overview = await getMonthOverview({ transactions, categories, budgets }, "2026-10");

    expect(overview.budgets).toEqual([
      {
        categoryId: LEISURE.id,
        limitCents: 40_000,
        spentCents: 10_000,
        remainingCents: 30_000,
        usage: 0.25,
        state: "ok",
      },
    ]);
  });

  it("devolve totais zerados e nenhum gasto num mês sem lançamentos", async () => {
    const overview = await getMonthOverview({ transactions, categories, budgets }, "2026-10");
    expect(overview).toMatchObject({
      transactions: [],
      summary: { incomeCents: 0, expenseCents: 0, balanceCents: 0 },
      spending: [],
      budgets: [],
    });
  });
});
