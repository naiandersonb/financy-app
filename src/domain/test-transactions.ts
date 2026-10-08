import type { Transaction } from "./transaction.types";

/** Fábrica de lançamentos para testes; preenche o que o teste não precisa especificar. */
export function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "t-1",
    kind: "expense",
    description: "Teste",
    amountCents: 1000,
    category: "Outros",
    occurredOn: "2026-10-08",
    ...overrides,
  };
}
