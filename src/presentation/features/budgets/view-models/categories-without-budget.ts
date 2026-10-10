import type { BudgetStatus, Category } from "@/domain";
import { categoriesByKind } from "@/presentation/features/categories";

/** Categorias de despesa que ainda podem receber um limite, em ordem alfabética. */
export function categoriesWithoutBudget(
  categories: Category[],
  budgets: Pick<BudgetStatus, "categoryId">[],
): Category[] {
  const withBudget = new Set(budgets.map((budget) => budget.categoryId));
  return categoriesByKind(categories).expense.filter((category) => !withBudget.has(category.id));
}
