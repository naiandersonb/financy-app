import type { BudgetRepository } from "../ports/budget-repository";

export function deleteBudget(budgets: BudgetRepository, categoryId: string): Promise<void> {
  return budgets.delete(categoryId);
}
