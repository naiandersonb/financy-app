import type { Budget } from "./budget.types";
import { expenseTotalsByCategory } from "./expense-totals";
import type { Transaction } from "./transaction.types";

/** A partir deste uso (80%), o orçamento pede atenção. */
export const BUDGET_WARNING_USAGE = 0.8;

export type BudgetState = "ok" | "warning" | "over";

export type BudgetStatus = {
  categoryId: string;
  limitCents: number;
  spentCents: number;
  /** Negativo quando o limite foi ultrapassado. */
  remainingCents: number;
  /** Gasto ÷ limite (1 = 100%); pode passar de 1. */
  usage: number;
  state: BudgetState;
};

function stateFor(usage: number): BudgetState {
  if (usage > 1) return "over";
  if (usage >= BUDGET_WARNING_USAGE) return "warning";
  return "ok";
}

/** Situação de cada orçamento no mês: estourados primeiro, depois do maior para o menor uso. */
export function budgetStatuses(
  budgets: Budget[],
  transactions: Transaction[],
): BudgetStatus[] {
  const totals = expenseTotalsByCategory(transactions);
  return budgets
    .map(({ categoryId, limitCents }) => {
      const spentCents = totals.get(categoryId) ?? 0;
      const usage = spentCents / limitCents;
      return {
        categoryId,
        limitCents,
        spentCents,
        remainingCents: limitCents - spentCents,
        usage,
        state: stateFor(usage),
      };
    })
    .sort((a, b) => Number(b.state === "over") - Number(a.state === "over") || b.usage - a.usage);
}
