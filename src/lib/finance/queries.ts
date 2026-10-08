import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { monthDateRange, type Budget, type MonthKey, type Transaction } from "@/domain";

type TransactionRow = {
  id: string;
  kind: Transaction["kind"];
  description: string;
  amount_cents: number;
  category: string;
  occurred_on: string;
};

export async function listTransactionsForMonth(month: MonthKey): Promise<Transaction[]> {
  const supabase = await createSupabaseServerClient();
  const { start, endExclusive } = monthDateRange(month);
  const { data, error } = await supabase
    .from("transactions")
    .select("id, kind, description, amount_cents, category, occurred_on")
    .gte("occurred_on", start)
    .lt("occurred_on", endExclusive)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })
    .overrideTypes<TransactionRow[], { merge: false }>();

  if (error) throw new Error("Falha ao carregar lançamentos.", { cause: error });

  return data.map((row) => ({
    id: row.id,
    kind: row.kind,
    description: row.description,
    amountCents: row.amount_cents,
    category: row.category,
    occurredOn: row.occurred_on,
  }));
}

export async function listBudgets(): Promise<Budget[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("budgets")
    .select("category, limit_cents")
    .order("category")
    .overrideTypes<{ category: string; limit_cents: number }[], { merge: false }>();

  if (error) throw new Error("Falha ao carregar orçamentos.", { cause: error });

  return data.map((row) => ({ category: row.category, limitCents: row.limit_cents }));
}
