import type { SupabaseClient } from "@supabase/supabase-js";
import type { BudgetRepository } from "@/application";
import type { Budget } from "@/domain";
import { toDatabaseError } from "./database-error";

type BudgetRow = { category_id: string; limit_cents: number };

export class SupabaseBudgetRepository implements BudgetRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(): Promise<Budget[]> {
    const { data, error } = await this.client
      .from("budgets")
      .select("category_id, limit_cents")
      .overrideTypes<BudgetRow[], { merge: false }>();

    if (error) throw toDatabaseError("Falha ao carregar orçamentos", error);
    return data.map((row) => ({ categoryId: row.category_id, limitCents: row.limit_cents }));
  }

  async upsert(userId: string, { categoryId, limitCents }: Budget): Promise<void> {
    // user_id explícito: o upsert resolve o conflito pela chave primária (user_id, category_id).
    const { error } = await this.client
      .from("budgets")
      .upsert({ user_id: userId, category_id: categoryId, limit_cents: limitCents });
    if (error) throw toDatabaseError("Falha ao salvar orçamento", error);
  }

  async delete(categoryId: string): Promise<void> {
    const { error } = await this.client.from("budgets").delete().eq("category_id", categoryId);
    if (error) throw toDatabaseError("Falha ao excluir orçamento", error);
  }
}
