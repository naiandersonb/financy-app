import {
  spendingByCategory,
  summarizeMonth,
  type Category,
  type CategorySpending,
  type MonthKey,
  type MonthSummary,
  type Transaction,
} from "@/domain";
import type { CategoryRepository } from "../ports/category-repository";
import type { TransactionRepository } from "../ports/transaction-repository";
import { listMonthTransactions } from "./list-month-transactions";

export type MonthOverview = {
  transactions: Transaction[];
  summary: MonthSummary;
  /** Categorias do usuário, para os selos e os formulários da tela. */
  categories: Category[];
  spending: CategorySpending[];
};

/** Tudo o que a tela do mês mostra (a spec 07 acrescenta os orçamentos). */
export async function getMonthOverview(
  deps: { transactions: TransactionRepository; categories: CategoryRepository },
  month: MonthKey,
): Promise<MonthOverview> {
  const [monthTransactions, categories] = await Promise.all([
    listMonthTransactions(deps.transactions, month),
    deps.categories.list(),
  ]);
  return {
    transactions: monthTransactions,
    summary: summarizeMonth(monthTransactions),
    categories,
    spending: spendingByCategory(monthTransactions, categories),
  };
}
