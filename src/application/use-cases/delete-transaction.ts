import type { TransactionRepository } from "../ports/transaction-repository";

export function deleteTransaction(
  transactions: TransactionRepository,
  id: string,
): Promise<void> {
  return transactions.delete(id);
}
