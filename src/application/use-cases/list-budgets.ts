import type { Budget } from "@/domain";
import type { BudgetRepository } from "../ports/budget-repository";

export function listBudgets(budgets: BudgetRepository): Promise<Budget[]> {
  return budgets.list();
}
