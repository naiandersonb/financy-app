import {
  budgetStatuses,
  spendingByCategory,
  type BudgetStatus,
  summarizeMonth,
  type Category,
  type CategorySpending,
  type MonthKey,
  type MonthSummary,
  type Transaction,
} from "@/domain";
import type { BudgetRepository } from "../ports/budget-repository";
import type { CategoryRepository } from "../ports/category-repository";
import type { TransactionRepository } from "../ports/transaction-repository";
import { listMonthTransactions } from "./list-month-transactions";

export type MonthOverview = {
  transactions: Transaction[];
  summary: MonthSummary;
  /** Categorias do usuário, para os selos e os formulários da tela. */
  categories: Category[];
  spending: CategorySpending[];
  budgets: BudgetStatus[];
};

/** Tudo o que a tela do mês mostra. */
export async function getMonthOverview(
  deps: {
    transactions: TransactionRepository;
    categories: CategoryRepository;
    budgets: BudgetRepository;
  },
  month: MonthKey,
): Promise<MonthOverview> {
  const [monthTransactions, categories, budgets] = await Promise.all([
    listMonthTransactions(deps.transactions, month),
    deps.categories.list(),
    deps.budgets.list(),
  ]);
  return {
    transactions: monthTransactions,
    summary: summarizeMonth(monthTransactions),
    categories,
    spending: spendingByCategory(monthTransactions, categories),
    budgets: budgetStatuses(budgets, monthTransactions),
  };
}
