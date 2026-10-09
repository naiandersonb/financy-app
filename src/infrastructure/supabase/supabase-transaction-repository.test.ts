/** @jest-environment node */
import { createSupabaseClientMock } from "./testing/supabase-client-mock";
import { SupabaseTransactionRepository } from "./supabase-transaction-repository";

const input = {
  kind: "expense" as const,
  description: "Mercado",
  amountCents: 15_050,
  categoryId: "cat-alimentacao",
  occurredOn: "2026-10-08",
};
const row = {
  kind: "expense",
  description: "Mercado",
  amount_cents: 15_050,
  category_id: "cat-alimentacao",
  occurred_on: "2026-10-08",
};
const dbError = { code: "42501", message: "permission denied", details: "linha com valores" };

describe("SupabaseTransactionRepository", () => {
  it("lista o intervalo do mês, ordenado, e converte as linhas em entidades", async () => {
    const { client, calls } = createSupabaseClientMock({
      data: [{ id: "a", ...row }],
      error: null,
    });
    const result = await new SupabaseTransactionRepository(client).listByDateRange({
      start: "2026-10-01",
      endExclusive: "2026-11-01",
    });

    expect(result).toEqual([{ id: "a", ...input }]);
    expect(calls).toEqual(
      expect.arrayContaining([
        ["from", ["transactions"]],
        ["gte", ["occurred_on", "2026-10-01"]],
        ["lt", ["occurred_on", "2026-11-01"]],
        ["order", ["occurred_on", { ascending: false }]],
        ["order", ["created_at", { ascending: false }]],
      ]),
    );
  });

  it("insere convertendo para colunas do banco", async () => {
    const { client, calls } = createSupabaseClientMock({ error: null });
    await new SupabaseTransactionRepository(client).create(input);
    expect(calls).toContainEqual(["insert", [row]]);
  });

  it("atualiza pelo id", async () => {
    const { client, calls } = createSupabaseClientMock({ error: null });
    await new SupabaseTransactionRepository(client).update("abc", input);
    expect(calls).toContainEqual(["update", [row]]);
    expect(calls).toContainEqual(["eq", ["id", "abc"]]);
  });

  it("exclui pelo id", async () => {
    const { client, calls } = createSupabaseClientMock({ error: null });
    await new SupabaseTransactionRepository(client).delete("abc");
    expect(calls).toContainEqual(["delete", []]);
    expect(calls).toContainEqual(["eq", ["id", "abc"]]);
  });

  it.each([
    ["listByDateRange", (r: SupabaseTransactionRepository) =>
      r.listByDateRange({ start: "2026-10-01", endExclusive: "2026-11-01" }), "Falha ao carregar lançamentos"],
    ["create", (r: SupabaseTransactionRepository) => r.create(input), "Falha ao criar lançamento"],
    ["update", (r: SupabaseTransactionRepository) => r.update("a", input), "Falha ao atualizar lançamento"],
    ["delete", (r: SupabaseTransactionRepository) => r.delete("a"), "Falha ao excluir lançamento"],
  ])("%s lança erro sem os detalhes do banco", async (_name, run, message) => {
    const { client } = createSupabaseClientMock({ error: dbError });
    const promise = run(new SupabaseTransactionRepository(client));
    await expect(promise).rejects.toThrow(`${message} (código 42501)`);
    await expect(promise).rejects.toMatchObject({
      cause: { code: "42501", message: "permission denied" },
    });
  });
});
