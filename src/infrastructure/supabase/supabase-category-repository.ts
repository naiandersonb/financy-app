import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryRepository } from "@/application";
import type { Category } from "@/domain";
import { toDatabaseError } from "./database-error";

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
}
