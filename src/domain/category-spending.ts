import { compareCategoryNames } from "./category";
import type { Category } from "./category.types";
import { expenseTotalsByCategory } from "./expense-totals";
import type { Transaction } from "./transaction.types";

export type CategorySpending = {
  categoryId: string;
  spentCents: number;
  /** Fração do total de despesas do mês, de 0 a 1. */
  shareOfExpenses: number;
};

/** Despesas do mês por categoria: maior gasto primeiro; empate em ordem alfabética do nome. */
export function spendingByCategory(
  transactions: Transaction[],
  categories: Pick<Category, "id" | "name">[],
): CategorySpending[] {
  const nameById = new Map(categories.map((category) => [category.id, category.name]));
  const nameOf = (id: string) => nameById.get(id) ?? "";
  const totals = expenseTotalsByCategory(transactions);
  const totalExpense = [...totals.values()].reduce((sum, cents) => sum + cents, 0);
  return [...totals.entries()]
    .map(([categoryId, spentCents]) => ({
      categoryId,
      spentCents,
      shareOfExpenses: spentCents / totalExpense,
    }))
    .sort(
      (a, b) =>
        b.spentCents - a.spentCents || compareCategoryNames(nameOf(a.categoryId), nameOf(b.categoryId)),
    );
}
