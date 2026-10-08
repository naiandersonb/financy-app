import type { Transaction } from "@/domain";

export type TransactionInput = Omit<Transaction, "id">;

export type DateRange = { start: string; endExclusive: string };

/** Falhas de infraestrutura são lançadas como exceção; não há falha prevista aqui. */
export interface TransactionRepository {
  listByDateRange(range: DateRange): Promise<Transaction[]>;
  create(input: TransactionInput): Promise<void>;
  update(id: string, input: TransactionInput): Promise<void>;
  delete(id: string): Promise<void>;
}
