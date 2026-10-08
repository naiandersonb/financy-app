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

export type Budget = {
  category: string;
  limitCents: number;
};

export type FormResult = { ok: true } | { ok: false; error: string };
