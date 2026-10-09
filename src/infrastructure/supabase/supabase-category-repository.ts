import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CategoryChanges,
  CategoryInput,
  CategoryRepository,
  CategoryUsage,
} from "@/application";
import type { Category } from "@/domain";
import { fail, succeed, type Result } from "@/shared";
import { toDatabaseError } from "./database-error";

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";
const CATEGORY_COLUMNS = "id, kind, name, background_color, text_color";

type CategoryRow = {
  id: string;
  kind: Category["kind"];
  name: string;
  background_color: string;
  text_color: string;
};

export class SupabaseCategoryRepository implements CategoryRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(): Promise<Category[]> {
    const { data, error } = await this.client
      .from("categories")
      .select(CATEGORY_COLUMNS)
      .overrideTypes<CategoryRow[], { merge: false }>();

    if (error) throw toDatabaseError("Falha ao carregar categorias", error);
    return data.map(toCategory);
  }

  async findById(id: string): Promise<Category | null> {
    const { data, error } = await this.client
      .from("categories")
      .select(CATEGORY_COLUMNS)
      .eq("id", id)
      .maybeSingle()
      .overrideTypes<CategoryRow | null, { merge: false }>();

    if (error) throw toDatabaseError("Falha ao carregar categoria", error);
    return data ? toCategory(data) : null;
  }

  async count(): Promise<number> {
    const { count, error } = await this.client
      .from("categories")
      .select("id", { count: "exact", head: true });
    if (error) throw toDatabaseError("Falha ao contar categorias", error);
    return count ?? 0;
  }

  async create(input: CategoryInput): Promise<Result<void, "duplicate-name">> {
    // user_id vem do default auth.uid() da tabela.
    const { error } = await this.client.from("categories").insert({
      kind: input.kind,
      name: input.name,
      background_color: input.backgroundColor,
      text_color: input.textColor,
    });
    if (!error) return succeed();
    if (error.code === UNIQUE_VIOLATION) return fail("duplicate-name");
    throw toDatabaseError("Falha ao criar categoria", error);
  }

  async update(id: string, changes: CategoryChanges): Promise<Result<void, "duplicate-name">> {
    const { error } = await this.client
      .from("categories")
      .update({
        name: changes.name,
        background_color: changes.backgroundColor,
        text_color: changes.textColor,
      })
      .eq("id", id);
    if (!error) return succeed();
    if (error.code === UNIQUE_VIOLATION) return fail("duplicate-name");
    throw toDatabaseError("Falha ao atualizar categoria", error);
  }

  async usage(id: string): Promise<CategoryUsage> {
    const [transactions, budgets] = await Promise.all([
      this.countReferences("transactions", id),
      this.countReferences("budgets", id),
    ]);
    return { transactions, hasBudget: budgets > 0 };
  }

  async delete(id: string): Promise<Result<void, "in-use">> {
    const { error } = await this.client.from("categories").delete().eq("id", id);
    if (!error) return succeed();
    if (error.code === FOREIGN_KEY_VIOLATION) return fail("in-use");
    throw toDatabaseError("Falha ao remover categoria", error);
  }

  private async countReferences(table: "transactions" | "budgets", id: string): Promise<number> {
    const { count, error } = await this.client
      .from(table)
      .select("category_id", { count: "exact", head: true })
      .eq("category_id", id);
    if (error) throw toDatabaseError(`Falha ao verificar uso da categoria em ${table}`, error);
    return count ?? 0;
  }
}

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    backgroundColor: row.background_color,
    textColor: row.text_color,
  };
}
