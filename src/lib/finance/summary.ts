import type { Budget, Transaction } from "./types";

export type MonthSummary = {
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
};

export type CategorySpending = {
  category: string;
  spentCents: number;
  /** Fração do total de despesas do mês, de 0 a 1. */
  shareOfExpenses: number;
};

export type BudgetStatus = {
  category: string;
  limitCents: number;
  spentCents: number;
  remainingCents: number;
  isOverLimit: boolean;
};

export function summarizeMonth(transactions: Transaction[]): MonthSummary {
  let incomeCents = 0;
  let expenseCents = 0;
  for (const transaction of transactions) {
    if (transaction.kind === "income") incomeCents += transaction.amountCents;
    else expenseCents += transaction.amountCents;
  }
  return { incomeCents, expenseCents, balanceCents: incomeCents - expenseCents };
}

export function spendingByCategory(transactions: Transaction[]): CategorySpending[] {
  const totals = expenseTotalsByCategory(transactions);
  const totalExpense = [...totals.values()].reduce((sum, cents) => sum + cents, 0);
  return [...totals.entries()]
    .map(([category, spentCents]) => ({
      category,
      spentCents,
      shareOfExpenses: totalExpense === 0 ? 0 : spentCents / totalExpense,
    }))
    .sort((a, b) => b.spentCents - a.spentCents);
}

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

function expenseTotalsByCategory(transactions: Transaction[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const transaction of transactions) {
    if (transaction.kind !== "expense") continue;
    totals.set(
      transaction.category,
      (totals.get(transaction.category) ?? 0) + transaction.amountCents,
    );
  }
  return totals;
}
