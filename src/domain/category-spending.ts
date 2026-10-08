import { expenseTotalsByCategory } from "./expense-totals";
import type { Transaction } from "./transaction.types";

export type CategorySpending = {
  category: string;
  spentCents: number;
  /** Fração do total de despesas do mês, de 0 a 1. */
  shareOfExpenses: number;
};

export function spendingByCategory(transactions: Transaction[]): CategorySpending[] {
  const totals = expenseTotalsByCategory(transactions);
  const totalExpense = [...totals.values()].reduce((sum, cents) => sum + cents, 0);
  return [...totals.entries()]
    .map(([category, spentCents]) => ({
      category,
      spentCents,
      shareOfExpenses: spentCents / totalExpense,
    }))
    .sort((a, b) => b.spentCents - a.spentCents);
}
