/** @jest-environment node */
import { createSupabaseClientMock } from "./testing/supabase-client-mock";
import { SupabaseCategoryRepository } from "./supabase-category-repository";

describe("SupabaseCategoryRepository", () => {
  it("lista as categorias convertendo as colunas para a entidade", async () => {
    const { client, calls } = createSupabaseClientMock({
      data: [
        { id: "c-1", kind: "expense", name: "Lazer", background_color: "#dcfce7", text_color: "#166534" },
      ],
      error: null,
    });

    const result = await new SupabaseCategoryRepository(client).list();

    expect(result).toEqual([
      { id: "c-1", kind: "expense", name: "Lazer", backgroundColor: "#dcfce7", textColor: "#166534" },
    ]);
    expect(calls).toContainEqual(["from", ["categories"]]);
  });

  it("lança erro com contexto quando o banco falha", async () => {
    const { client } = createSupabaseClientMock({ error: { code: "42501", message: "x" } });
    await expect(new SupabaseCategoryRepository(client).list()).rejects.toThrow(
      "Falha ao carregar categorias (código 42501)",
    );
  });
});
