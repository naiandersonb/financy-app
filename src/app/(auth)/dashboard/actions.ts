"use server";

import { endOfMonth, format, startOfMonth } from "date-fns";
import { redirect } from "next/navigation";

import type {
  RecurringTransactionWithCategory,
  TransactionWithCategory,
} from "@/app/core/domain/transactions/transaction.entity";
import { createClient } from "@/lib/supabase/server";

export async function getDashboardData(month: Date) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  const userId = data.claims.sub;
  const start = startOfMonth(month);
  const end = endOfMonth(month);

  const [transactionsResult, recurringResult, categoriesResult] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .gte("transaction_date", format(start, "yyyy-MM-dd"))
        .lte("transaction_date", format(end, "yyyy-MM-dd"))
        .order("transaction_date", { ascending: false }),
      supabase
        .from("recurring_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("next_occurrence_date", { ascending: true }),
      supabase.from("categories").select("*").eq("user_id", userId),
    ]);

  const categoryById = new Map(
    (categoriesResult.data ?? []).map((category) => [category.id, category])
  );

  const transactions: TransactionWithCategory[] = (
    transactionsResult.data ?? []
  ).map((transaction) => ({
    ...transaction,
    category: categoryById.get(transaction.category_id) ?? null,
  }));

  const recurringTransactions: RecurringTransactionWithCategory[] = (
    recurringResult.data ?? []
  ).map((transaction) => ({
    ...transaction,
    category: categoryById.get(transaction.category_id) ?? null,
  }));

  return {
    month: format(start, "yyyy-MM"),
    transactions,
    recurringTransactions,
    error:
      transactionsResult.error?.message ??
      recurringResult.error?.message ??
      categoriesResult.error?.message ??
      null,
  };
}
