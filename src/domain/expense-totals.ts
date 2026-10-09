import type { Transaction } from "./transaction.types";

/** Soma das despesas por id de categoria; receitas são ignoradas. */
export function expenseTotalsByCategory(transactions: Transaction[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const transaction of transactions) {
    if (transaction.kind !== "expense") continue;
    totals.set(
      transaction.categoryId,
      (totals.get(transaction.categoryId) ?? 0) + transaction.amountCents,
    );
  }
  return totals;
}
