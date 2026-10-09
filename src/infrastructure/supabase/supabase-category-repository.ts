import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryInput, CategoryRepository } from "@/application";
import type { Category } from "@/domain";
import { fail, succeed, type Result } from "@/shared";
import { toDatabaseError } from "./database-error";

const UNIQUE_VIOLATION = "23505";
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
