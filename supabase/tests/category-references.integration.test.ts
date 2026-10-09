import { categoryIdOf, createTestUser, deleteTestUser, type TestUser } from "./local-supabase";

const FOREIGN_KEY_VIOLATION = "23503";

describe("lançamentos e orçamentos referenciam a categoria por id", () => {
  let userA: TestUser;
  let userB: TestUser;
  let housingOfA: string;
  let salaryOfA: string;
  let housingOfB: string;

  beforeAll(async () => {
    userA = await createTestUser("a");
    userB = await createTestUser("b");
    housingOfA = await categoryIdOf(userA, "expense", "Moradia");
    salaryOfA = await categoryIdOf(userA, "income", "Salário");
    housingOfB = await categoryIdOf(userB, "expense", "Moradia");
  });

  afterAll(async () => {
    await deleteTestUser(userA);
    await deleteTestUser(userB);
  });

  function transaction(kind: string, categoryId: string) {
    return {
      kind,
      description: "Teste",
      amount_cents: 1_000,
      category_id: categoryId,
      occurred_on: "2026-10-01",
    };
  }

  describe("lançamento", () => {
    it("aceita categoria do próprio usuário e do mesmo tipo", async () => {
      const { error } = await userA.client
        .from("transactions")
        .insert(transaction("expense", housingOfA));
      expect(error).toBeNull();
    });

    it("recusa categoria de outro tipo", async () => {
      const { error } = await userA.client
        .from("transactions")
        .insert(transaction("expense", salaryOfA));
      expect(error?.code).toBe(FOREIGN_KEY_VIOLATION);
    });

    it("recusa categoria de outro usuário", async () => {
      const { error } = await userA.client
        .from("transactions")
        .insert(transaction("expense", housingOfB));
      expect(error?.code).toBe(FOREIGN_KEY_VIOLATION);
    });
  });

  describe("orçamento", () => {
    it("aceita categoria de despesa do próprio usuário", async () => {
      const { error } = await userA.client
        .from("budgets")
        .insert({ category_id: housingOfA, limit_cents: 100_000 });
      expect(error).toBeNull();
    });

    it("recusa categoria de receita", async () => {
      const { error } = await userA.client
        .from("budgets")
        .insert({ category_id: salaryOfA, limit_cents: 100_000 });
      expect(error?.code).toBe(FOREIGN_KEY_VIOLATION);
    });

    it("recusa categoria de outro usuário", async () => {
      const { error } = await userA.client
        .from("budgets")
        .insert({ category_id: housingOfB, limit_cents: 100_000 });
      expect(error?.code).toBe(FOREIGN_KEY_VIOLATION);
    });
  });

  it("impede apagar uma categoria em uso", async () => {
    const { error } = await userA.client.from("categories").delete().eq("id", housingOfA);
    expect(error?.code).toBe(FOREIGN_KEY_VIOLATION);
  });
});
