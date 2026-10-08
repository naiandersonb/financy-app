import { monthDateRange, type MonthKey, type Transaction } from "@/domain";
import type { TransactionRepository } from "../ports/transaction-repository";

export function listMonthTransactions(
  transactions: TransactionRepository,
  month: MonthKey,
): Promise<Transaction[]> {
  return transactions.listByDateRange(monthDateRange(month));
}
