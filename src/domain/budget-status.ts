import type { Budget } from "./budget.types";
import { expenseTotalsByCategory } from "./expense-totals";
import type { Transaction } from "./transaction.types";

export type BudgetStatus = {
  categoryId: string;
  limitCents: number;
  spentCents: number;
  remainingCents: number;
  isOverLimit: boolean;
};

export function budgetStatuses(
  budgets: Budget[],
  transactions: Transaction[],
): BudgetStatus[] {
  const totals = expenseTotalsByCategory(transactions);
  return budgets.map(({ categoryId, limitCents }) => {
    const spentCents = totals.get(categoryId) ?? 0;
    return {
      categoryId,
      limitCents,
      spentCents,
      remainingCents: limitCents - spentCents,
      isOverLimit: spentCents > limitCents,
    };
  });
}
