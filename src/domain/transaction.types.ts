export type TransactionKind = "income" | "expense";

export type Transaction = {
  id: string;
  kind: TransactionKind;
  description: string;
  amountCents: number;
  category: string;
  /** Data no formato YYYY-MM-DD. */
  occurredOn: string;
};
