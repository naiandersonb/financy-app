import type { Budget } from "@/domain";

/** Falhas de infraestrutura são lançadas como exceção; não há falha prevista aqui. */
export interface BudgetRepository {
  list(): Promise<Budget[]>;
  upsert(userId: string, budget: Budget): Promise<void>;
  delete(category: string): Promise<void>;
}
