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

  describe("update", () => {
    const changes = { name: "Diversão", backgroundColor: "#fde68a", textColor: "#78350f" };

    it("altera nome e cores pelo id, sem tocar no tipo", async () => {
      const { client, calls } = createSupabaseClientMock({ error: null });
      expect(await new SupabaseCategoryRepository(client).update("c-1", changes)).toEqual({
        ok: true,
        value: undefined,
      });
      expect(calls).toContainEqual([
        "update",
        [{ name: "Diversão", background_color: "#fde68a", text_color: "#78350f" }],
      ]);
      expect(calls).toContainEqual(["eq", ["id", "c-1"]]);
    });

    it("traduz a violação de unicidade em nome duplicado", async () => {
      const { client } = createSupabaseClientMock({ error: { code: "23505", message: "duplicate" } });
      expect(await new SupabaseCategoryRepository(client).update("c-1", changes)).toEqual({
        ok: false,
        error: "duplicate-name",
      });
    });

    it("lança erro com contexto nas outras falhas", async () => {
      const { client } = createSupabaseClientMock({ error: { code: "23514", message: "check" } });
      await expect(new SupabaseCategoryRepository(client).update("c-1", changes)).rejects.toThrow(
        "Falha ao atualizar categoria (código 23514)",
      );
    });
  });

  describe("usage", () => {
    it("conta lançamentos e orçamentos que usam a categoria", async () => {
      const { client, calls } = createSupabaseClientMock({ count: 2, error: null });
      expect(await new SupabaseCategoryRepository(client).usage("c-1")).toEqual({
        transactions: 2,
        hasBudget: true,
      });
      expect(calls).toContainEqual(["from", ["transactions"]]);
      expect(calls).toContainEqual(["from", ["budgets"]]);
      expect(calls).toContainEqual(["eq", ["category_id", "c-1"]]);
    });

    it("trata contagem ausente como sem uso", async () => {
      const { client } = createSupabaseClientMock({ count: null, error: null });
      expect(await new SupabaseCategoryRepository(client).usage("c-1")).toEqual({
        transactions: 0,
        hasBudget: false,
      });
    });

    it("lança erro com contexto quando o banco falha", async () => {
      const { client } = createSupabaseClientMock({ error: { code: "42501", message: "x" } });
      await expect(new SupabaseCategoryRepository(client).usage("c-1")).rejects.toThrow(
        "Falha ao verificar uso da categoria em transactions (código 42501)",
      );
    });
  });

  describe("delete", () => {
    it("remove pelo id", async () => {
      const { client, calls } = createSupabaseClientMock({ error: null });
      expect(await new SupabaseCategoryRepository(client).delete("c-1")).toEqual({
        ok: true,
        value: undefined,
      });
      expect(calls).toContainEqual(["delete", []]);
      expect(calls).toContainEqual(["eq", ["id", "c-1"]]);
    });

    it("traduz a violação de chave estrangeira em categoria em uso", async () => {
      const { client } = createSupabaseClientMock({ error: { code: "23503", message: "fk" } });
      expect(await new SupabaseCategoryRepository(client).delete("c-1")).toEqual({
        ok: false,
        error: "in-use",
      });
    });

    it("lança erro com contexto nas outras falhas", async () => {
      const { client } = createSupabaseClientMock({ error: { code: "42501", message: "x" } });
      await expect(new SupabaseCategoryRepository(client).delete("c-1")).rejects.toThrow(
        "Falha ao remover categoria (código 42501)",
      );
    });
  });
});
