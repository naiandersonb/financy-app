"use server";

import { endOfMonth, format, startOfMonth } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type {
  CardType,
  Category,
  PaymentMethod,
  RecurringTransactionWithCategory,
  TransactionType,
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

  const categories: Category[] = categoriesResult.data ?? [];

  return {
    month: format(start, "yyyy-MM"),
    transactions,
    recurringTransactions,
    categories,
    error:
      transactionsResult.error?.message ??
      recurringResult.error?.message ??
      categoriesResult.error?.message ??
      null,
  };
}

export type CreateTransactionInput = {
  title: string;
  amount: number;
  transaction_date: string;
  category_id: string;
  type: TransactionType;
  payment_method: PaymentMethod;
  card_type: CardType | null;
  notes?: string | null;
};

export async function createTransaction(input: CreateTransactionInput) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from("transactions").insert({
    user_id: data.claims.sub,
    title: input.title,
    amount: input.amount,
    transaction_date: input.transaction_date,
    category_id: input.category_id,
    type: input.type,
    status: "posted",
    currency: "BRL",
    notes: input.notes?.trim() || null,
    payment_method: input.payment_method,
    card_type: input.card_type,
    created_at: now,
    updated_at: now,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/dashboard");

  return { error: null };
}

export type CreateCategoryInput = {
  name: string;
  style: Record<string, string>;
};

export async function createCategory(input: CreateCategoryInput) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  const now = new Date().toISOString();

  const { data: category, error: insertError } = await supabase
    .from("categories")
    .insert({
      user_id: data.claims.sub,
      name: input.name,
      style: input.style,
      is_active: true,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (insertError) {
    return { category: null, error: insertError.message };
  }

  revalidatePath("/dashboard");

  return { category, error: null };
}
