import type { SupabaseClient } from "@supabase/supabase-js";
import type { DateRange, TransactionInput, TransactionRepository } from "@/application";
import type { Transaction } from "@/domain";
import { toDatabaseError } from "./database-error";

type TransactionRow = {
  id: string;
  kind: Transaction["kind"];
  description: string;
  amount_cents: number;
  category: string;
  occurred_on: string;
};

export class SupabaseTransactionRepository implements TransactionRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listByDateRange({ start, endExclusive }: DateRange): Promise<Transaction[]> {
    const { data, error } = await this.client
      .from("transactions")
      .select("id, kind, description, amount_cents, category, occurred_on")
      .gte("occurred_on", start)
      .lt("occurred_on", endExclusive)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false })
      .overrideTypes<TransactionRow[], { merge: false }>();

    if (error) throw toDatabaseError("Falha ao carregar lançamentos", error);
    return data.map(toTransaction);
  }

  async create(input: TransactionInput): Promise<void> {
    const { error } = await this.client.from("transactions").insert(toRow(input));
    if (error) throw toDatabaseError("Falha ao criar lançamento", error);
  }

  async update(id: string, input: TransactionInput): Promise<void> {
    const { error } = await this.client.from("transactions").update(toRow(input)).eq("id", id);
    if (error) throw toDatabaseError("Falha ao atualizar lançamento", error);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from("transactions").delete().eq("id", id);
    if (error) throw toDatabaseError("Falha ao excluir lançamento", error);
  }
}

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    kind: row.kind,
    description: row.description,
    amountCents: row.amount_cents,
    category: row.category,
    occurredOn: row.occurred_on,
  };
}

function toRow(input: TransactionInput) {
  return {
    kind: input.kind,
    description: input.description,
    amount_cents: input.amountCents,
    category: input.category,
    occurred_on: input.occurredOn,
  };
}
