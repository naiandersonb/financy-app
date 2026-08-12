export type TransactionType = "income" | "expense"

export type TransactionStatus = "pending" | "posted" | "voided"

export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly"

export type Transaction = {
  id: string
  user_id: string
  title: string
  amount: number
  transaction_date: string
  category_id: string
  type: TransactionType
  status: TransactionStatus
  currency: string
  notes: string | null
  recurring_transaction_id: string | null
  created_at: string
  updated_at: string
}

export type RecurringTransaction = {
  id: string
  user_id: string
  title: string
  amount: number
  category_id: string
  type: TransactionType
  frequency: RecurringFrequency
  interval_count: number
  start_date: string | null
  end_date: string | null
  next_occurrence_date: string | null
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

// export interface Database {
//   public: {
//     Tables: {
//       transactions: {
//         Row: Transaction
//         Insert: Partial<Transaction> &
//           Pick<
//             Transaction,
//             | "user_id"
//             | "title"
//             | "amount"
//             | "transaction_date"
//             | "category_id"
//             | "type"
//             | "status"
//             | "currency"
//           >
//         Update: Partial<Transaction>
//         Relationships: []
//       }
//       recurring_transactions: {
//         Row: RecurringTransaction
//         Insert: Partial<RecurringTransaction> &
//           Pick<
//             RecurringTransaction,
//             | "user_id"
//             | "title"
//             | "amount"
//             | "category_id"
//             | "type"
//             | "frequency"
//             | "interval_count"
//             | "is_active"
//           >
//         Update: Partial<RecurringTransaction>
//         Relationships: []
//       }
//     }
//     Views: Record<string, never>
//     Functions: Record<string, never>
//   }
// }
