import type { SupabaseClient } from "@supabase/supabase-js";
import type { BudgetRepository } from "@/application";
import type { Budget } from "@/domain";
import { toDatabaseError } from "./database-error";

type BudgetRow = { category: string; limit_cents: number };

export class SupabaseBudgetRepository implements BudgetRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(): Promise<Budget[]> {
    const { data, error } = await this.client
      .from("budgets")
      .select("category, limit_cents")
      .order("category")
      .overrideTypes<BudgetRow[], { merge: false }>();

    if (error) throw toDatabaseError("Falha ao carregar orçamentos", error);
    return data.map((row) => ({ category: row.category, limitCents: row.limit_cents }));
  }

  async upsert(userId: string, { category, limitCents }: Budget): Promise<void> {
    // user_id explícito: o upsert resolve o conflito pela chave primária (user_id, category).
    const { error } = await this.client
      .from("budgets")
      .upsert({ user_id: userId, category, limit_cents: limitCents });
    if (error) throw toDatabaseError("Falha ao salvar orçamento", error);
  }

  async delete(category: string): Promise<void> {
    const { error } = await this.client.from("budgets").delete().eq("category", category);
    if (error) throw toDatabaseError("Falha ao excluir orçamento", error);
  }
}
