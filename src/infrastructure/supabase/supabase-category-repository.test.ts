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

  describe("findById", () => {
    it("busca uma única categoria pelo id", async () => {
      const { client, calls } = createSupabaseClientMock({
        data: { id: "c-1", kind: "income", name: "Salário", background_color: "#d1fae5", text_color: "#065f46" },
        error: null,
      });
      expect(await new SupabaseCategoryRepository(client).findById("c-1")).toEqual({
        id: "c-1",
        kind: "income",
        name: "Salário",
        backgroundColor: "#d1fae5",
        textColor: "#065f46",
      });
      expect(calls).toContainEqual(["eq", ["id", "c-1"]]);
      expect(calls).toContainEqual(["maybeSingle", []]);
    });

    it("devolve null quando não encontra (inclusive categoria de outro usuário, escondida pelo RLS)", async () => {
      const { client } = createSupabaseClientMock({ data: null, error: null });
      expect(await new SupabaseCategoryRepository(client).findById("c-x")).toBeNull();
    });

    it("lança erro com contexto quando o banco falha", async () => {
      const { client } = createSupabaseClientMock({ error: { code: "22P02", message: "x" } });
      await expect(new SupabaseCategoryRepository(client).findById("c-1")).rejects.toThrow(
        "Falha ao carregar categoria (código 22P02)",
      );
    });
  });

  describe("count", () => {
    it("conta só pelo cabeçalho, sem trazer as linhas", async () => {
      const { client, calls } = createSupabaseClientMock({ count: 13, error: null });
      expect(await new SupabaseCategoryRepository(client).count()).toBe(13);
      expect(calls).toContainEqual(["select", ["id", { count: "exact", head: true }]]);
    });

    it("trata contagem ausente como zero", async () => {
      const { client } = createSupabaseClientMock({ count: null, error: null });
      expect(await new SupabaseCategoryRepository(client).count()).toBe(0);
    });

    it("lança erro com contexto quando o banco falha", async () => {
      const { client } = createSupabaseClientMock({ error: { code: "42501", message: "x" } });
      await expect(new SupabaseCategoryRepository(client).count()).rejects.toThrow(
        "Falha ao contar categorias (código 42501)",
      );
    });
  });

  describe("create", () => {
    const pets = {
      kind: "expense" as const,
      name: "Pets",
      backgroundColor: "#fde68a",
      textColor: "#78350f",
    };

    it("insere convertendo para as colunas do banco", async () => {
      const { client, calls } = createSupabaseClientMock({ error: null });
      expect(await new SupabaseCategoryRepository(client).create(pets)).toEqual({
        ok: true,
        value: undefined,
      });
      expect(calls).toContainEqual([
        "insert",
        [{ kind: "expense", name: "Pets", background_color: "#fde68a", text_color: "#78350f" }],
      ]);
    });

    it("traduz a violação de unicidade em nome duplicado", async () => {
      const { client } = createSupabaseClientMock({ error: { code: "23505", message: "duplicate" } });
      expect(await new SupabaseCategoryRepository(client).create(pets)).toEqual({
        ok: false,
        error: "duplicate-name",
      });
    });

    it("lança erro com contexto nas outras falhas", async () => {
      const { client } = createSupabaseClientMock({ error: { code: "23514", message: "check" } });
      await expect(new SupabaseCategoryRepository(client).create(pets)).rejects.toThrow(
        "Falha ao criar categoria (código 23514)",
      );
    });
  });
});
