import type { BudgetRepository } from "../ports/budget-repository";

export function deleteBudget(budgets: BudgetRepository, category: string): Promise<void> {
  return budgets.delete(category);
}
