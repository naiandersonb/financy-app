import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryInput, CategoryRepository } from "@/application";
import type { Category } from "@/domain";
import { fail, succeed, type Result } from "@/shared";
import { toDatabaseError } from "./database-error";

const UNIQUE_VIOLATION = "23505";

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
      .select("id, kind, name, background_color, text_color")
      .overrideTypes<CategoryRow[], { merge: false }>();

    if (error) throw toDatabaseError("Falha ao carregar categorias", error);
    return data.map((row) => ({
      id: row.id,
      kind: row.kind,
      name: row.name,
      backgroundColor: row.background_color,
      textColor: row.text_color,
    }));
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
}
