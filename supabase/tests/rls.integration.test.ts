import {
  anonymousClient,
  categoryIdOf,
  createTestUser,
  deleteTestUser,
  queryDatabase,
  type TestUser,
} from "./local-supabase";


describe("isolamento entre usuários (RLS)", () => {
  let userA: TestUser;
  let userB: TestUser;
  let transactionId: string;
  let transactionOfA: Record<string, unknown>;
  let leisureOfA: string;
  let healthOfA: string;

  beforeAll(async () => {
    userA = await createTestUser("a");
    userB = await createTestUser("b");
    leisureOfA = await categoryIdOf(userA, "expense", "Lazer");
    healthOfA = await categoryIdOf(userA, "expense", "Saúde");
    transactionOfA = {
      kind: "expense",
      description: "Aluguel de A",
      amount_cents: 150_000,
      category_id: await categoryIdOf(userA, "expense", "Moradia"),
      occurred_on: "2026-10-01",
    };

    const transaction = await userA.client
      .from("transactions")
      .insert(transactionOfA)
      .select("id")
      .single();
    if (transaction.error) throw transaction.error;
    transactionId = transaction.data.id;

    const budget = await userA.client
      .from("budgets")
      .insert({ category_id: leisureOfA, limit_cents: 40_000 });
    if (budget.error) throw budget.error;
  });

  afterAll(async () => {
    await deleteTestUser(userA);
    await deleteTestUser(userB);
  });

  async function transactionAsSeenByA() {
    const { data } = await userA.client
      .from("transactions")
      .select("description, amount_cents")
      .eq("id", transactionId)
      .single();
    return data;
  }

  it("A vê os próprios dados (controle do teste)", async () => {
    expect(await transactionAsSeenByA()).toEqual({
      description: "Aluguel de A",
      amount_cents: 150_000,
    });
    const budgets = await userA.client.from("budgets").select("category_id");
    expect(budgets.data).toEqual([{ category_id: leisureOfA }]);
  });

  describe("B", () => {
    it("não lê lançamentos nem orçamentos de A", async () => {
      const transactions = await userB.client.from("transactions").select("id");
      const budgets = await userB.client.from("budgets").select("category_id");
      expect(transactions).toMatchObject({ error: null, data: [] });
      expect(budgets).toMatchObject({ error: null, data: [] });
    });

    it("não altera lançamento de A", async () => {
      const { data } = await userB.client
        .from("transactions")
        .update({ description: "Alterado por B", amount_cents: 1 })
        .eq("id", transactionId)
        .select("id");
      expect(data).toEqual([]);
      expect(await transactionAsSeenByA()).toMatchObject({ description: "Aluguel de A" });
    });

    it("não exclui lançamento nem orçamento de A", async () => {
      const transactions = await userB.client
        .from("transactions")
        .delete()
        .eq("id", transactionId)
        .select("id");
      const budgets = await userB.client
        .from("budgets")
        .delete()
        .eq("category_id", leisureOfA)
        .select("category_id");
      expect(transactions.data).toEqual([]);
      expect(budgets.data).toEqual([]);
      expect(await transactionAsSeenByA()).not.toBeNull();
    });

    it("não insere dados em nome de A", async () => {
      const transaction = await userB.client
        .from("transactions")
        .insert({ ...transactionOfA, user_id: userA.id });
      const budget = await userB.client
        .from("budgets")
        .insert({ user_id: userA.id, category_id: healthOfA, limit_cents: 1 });
      expect(transaction.error?.code).toBe("42501");
      expect(budget.error?.code).toBe("42501");
    });
  });

  describe("visitante sem sessão", () => {
    it("não lê nada", async () => {
      const visitor = anonymousClient();
      expect((await visitor.from("transactions").select("id")).data).toEqual([]);
      expect((await visitor.from("budgets").select("category_id")).data).toEqual([]);
    });

    it("não grava nada", async () => {
      const visitor = anonymousClient();
      const transaction = await visitor
        .from("transactions")
        .insert({ ...transactionOfA, user_id: userA.id });
      expect(transaction.error).not.toBeNull();
    });
  });

  it("toda tabela do schema public tem RLS habilitada", () => {
    const tablesWithoutRls = queryDatabase(
      "select coalesce(string_agg(tablename, ','), '') from pg_tables " +
        "where schemaname = 'public' and not rowsecurity",
    );
    expect(tablesWithoutRls).toBe("");
  });
});
