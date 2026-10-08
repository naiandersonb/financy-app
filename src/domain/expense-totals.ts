import type { Transaction } from "./transaction.types";

/** Soma das despesas por categoria; receitas são ignoradas. */
export function expenseTotalsByCategory(transactions: Transaction[]): Map<string, number> {
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
