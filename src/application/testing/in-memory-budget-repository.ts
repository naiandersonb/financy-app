import type { Budget } from "@/domain";
import type { BudgetRepository } from "../ports/budget-repository";

export class InMemoryBudgetRepository implements BudgetRepository {
  readonly byUser = new Map<string, Map<string, number>>();
  /** Usuário cujos orçamentos `list` e `delete` enxergam, como o RLS faria. */
  constructor(private readonly sessionUserId: string) {}

  async list(): Promise<Budget[]> {
    const budgets = this.byUser.get(this.sessionUserId) ?? new Map<string, number>();
    return [...budgets].map(([category, limitCents]) => ({ category, limitCents }));
  }

  async upsert(userId: string, { category, limitCents }: Budget): Promise<void> {
    const budgets = this.byUser.get(userId) ?? new Map<string, number>();
    budgets.set(category, limitCents);
    this.byUser.set(userId, budgets);
  }

  async delete(category: string): Promise<void> {
    this.byUser.get(this.sessionUserId)?.delete(category);
  }
}
