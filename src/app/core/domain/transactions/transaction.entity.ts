export type TransactionType = "income" | "expense";

export type TransactionStatus = "pending" | "posted" | "voided";

export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

export type PaymentMethod = "pix" | "cash" | "card";

export type CardType = "credit" | "debit";

export type Transaction = {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  transaction_date: string;
  category_id: string;
  type: TransactionType;
  status: TransactionStatus;
  currency: string;
  notes: string | null;
  recurring_transaction_id: string | null;
  created_at: string;
  updated_at: string;
  payment_method: PaymentMethod;
  card_type: CardType | null;
};

export type RecurringTransaction = {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category_id: string;
  type: TransactionType;
  frequency: RecurringFrequency;
  interval_count: number;
  start_date: string | null;
  end_date: string | null;
  next_occurrence_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  payment_method: PaymentMethod;
  card_type: CardType | null;
};

export type Category = {
  id: string;
  user_id: string;
  name: string;
  style: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type TransactionWithCategory = Transaction & {
  category: Category | null;
};

export type RecurringTransactionWithCategory = RecurringTransaction & {
  category: Category | null;
};
