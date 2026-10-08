import type { Budget } from "./budget.types";
import { expenseTotalsByCategory } from "./expense-totals";
import type { Transaction } from "./transaction.types";

export type BudgetStatus = {
  category: string;
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
  return budgets.map(({ category, limitCents }) => {
    const spentCents = totals.get(category) ?? 0;
    return {
      category,
      limitCents,
      spentCents,
      remainingCents: limitCents - spentCents,
      isOverLimit: spentCents > limitCents,
    };
  });
}
