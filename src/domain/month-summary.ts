import type { Transaction } from "./transaction.types";

export type MonthSummary = {
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
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
