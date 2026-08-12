"use server"

import { endOfMonth, format, startOfMonth } from "date-fns"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export async function getDashboardData(month: Date) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims?.sub) {
    redirect("/login")
  }

  const userId = data.claims.sub
  const start = startOfMonth(month)
  const end = endOfMonth(month)

  const [transactionsResult, recurringResult] = await Promise.all([
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
  ])

  return {
    month: format(start, "yyyy-MM"),
    transactions: transactionsResult.data ?? [],
    recurringTransactions: recurringResult.data ?? [],
    error: transactionsResult.error?.message ?? recurringResult.error?.message ?? null,
  }
}
