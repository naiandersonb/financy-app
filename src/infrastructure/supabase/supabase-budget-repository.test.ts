/** @jest-environment node */
import { createSupabaseClientMock } from "./testing/supabase-client-mock";
import { SupabaseBudgetRepository } from "./supabase-budget-repository";

const dbError = { code: "42501", message: "permission denied" };

describe("SupabaseBudgetRepository", () => {
  it("lista os orçamentos convertendo as colunas", async () => {
    const { client } = createSupabaseClientMock({
      data: [{ category_id: "cat-lazer", limit_cents: 40_000 }],
      error: null,
    });
    const result = await new SupabaseBudgetRepository(client).list();
    expect(result).toEqual([{ categoryId: "cat-lazer", limitCents: 40_000 }]);
  });

  it("faz upsert com o user_id explícito", async () => {
    const { client, calls } = createSupabaseClientMock({ error: null });
    await new SupabaseBudgetRepository(client).upsert("user-1", {
      categoryId: "cat-lazer",
      limitCents: 40_000,
    });
    expect(calls).toContainEqual([
      "upsert",
      [{ user_id: "user-1", category_id: "cat-lazer", limit_cents: 40_000 }],
    ]);
  });

  it("exclui pela categoria", async () => {
    const { client, calls } = createSupabaseClientMock({ error: null });
    await new SupabaseBudgetRepository(client).delete("cat-lazer");
    expect(calls).toContainEqual(["eq", ["category_id", "cat-lazer"]]);
  });

  it.each([
    ["list", (r: SupabaseBudgetRepository) => r.list(), "Falha ao carregar orçamentos"],
    ["upsert", (r: SupabaseBudgetRepository) =>
      r.upsert("u", { categoryId: "cat-lazer", limitCents: 1 }), "Falha ao salvar orçamento"],
    ["delete", (r: SupabaseBudgetRepository) => r.delete("cat-lazer"), "Falha ao excluir orçamento"],
  ])("%s lança erro com contexto", async (_name, run, message) => {
    const { client } = createSupabaseClientMock({ error: dbError });
    await expect(run(new SupabaseBudgetRepository(client))).rejects.toThrow(
      `${message} (código 42501)`,
    );
  });
});
