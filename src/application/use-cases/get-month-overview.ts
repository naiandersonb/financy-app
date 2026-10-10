import { summarizeMonth, type MonthKey, type MonthSummary, type Transaction } from "@/domain";
import type { TransactionRepository } from "../ports/transaction-repository";
import { listMonthTransactions } from "./list-month-transactions";

export type MonthOverview = {
  transactions: Transaction[];
  summary: MonthSummary;
};

/** Tudo o que a tela do mês mostra a partir dos lançamentos (as specs 06 e 07 acrescentam mais). */
export async function getMonthOverview(
  transactions: TransactionRepository,
  month: MonthKey,
): Promise<MonthOverview> {
  const monthTransactions = await listMonthTransactions(transactions, month);
  return { transactions: monthTransactions, summary: summarizeMonth(monthTransactions) };
}
