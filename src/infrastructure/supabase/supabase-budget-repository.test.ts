/** @jest-environment node */
import { createSupabaseClientMock } from "./testing/supabase-client-mock";
import { SupabaseBudgetRepository } from "./supabase-budget-repository";

const dbError = { code: "42501", message: "permission denied" };

describe("SupabaseBudgetRepository", () => {
  it("lista os orçamentos em ordem de categoria", async () => {
    const { client, calls } = createSupabaseClientMock({
      data: [{ category: "Lazer", limit_cents: 40_000 }],
      error: null,
    });
    const result = await new SupabaseBudgetRepository(client).list();
    expect(result).toEqual([{ category: "Lazer", limitCents: 40_000 }]);
    expect(calls).toContainEqual(["order", ["category"]]);
  });

  it("faz upsert com o user_id explícito", async () => {
    const { client, calls } = createSupabaseClientMock({ error: null });
    await new SupabaseBudgetRepository(client).upsert("user-1", {
      category: "Lazer",
      limitCents: 40_000,
    });
    expect(calls).toContainEqual([
      "upsert",
      [{ user_id: "user-1", category: "Lazer", limit_cents: 40_000 }],
    ]);
  });

  it("exclui pela categoria", async () => {
    const { client, calls } = createSupabaseClientMock({ error: null });
    await new SupabaseBudgetRepository(client).delete("Lazer");
    expect(calls).toContainEqual(["eq", ["category", "Lazer"]]);
  });

  it.each([
    ["list", (r: SupabaseBudgetRepository) => r.list(), "Falha ao carregar orçamentos"],
    ["upsert", (r: SupabaseBudgetRepository) =>
      r.upsert("u", { category: "Lazer", limitCents: 1 }), "Falha ao salvar orçamento"],
    ["delete", (r: SupabaseBudgetRepository) => r.delete("Lazer"), "Falha ao excluir orçamento"],
  ])("%s lança erro com contexto", async (_name, run, message) => {
    const { client } = createSupabaseClientMock({ error: dbError });
    await expect(run(new SupabaseBudgetRepository(client))).rejects.toThrow(
      `${message} (código 42501)`,
    );
  });
});
