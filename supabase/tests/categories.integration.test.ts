import {
  anonymousClient,
  createTestUser,
  deleteTestUser,
  type TestUser,
} from "./local-supabase";

// Tabela de categorias padrão da spec 03 (regra 4).
const DEFAULT_CATEGORIES = [
  { kind: "expense", name: "Alimentação", background_color: "#fef3c7", text_color: "#78350f" },
  { kind: "expense", name: "Compras", background_color: "#ffedd5", text_color: "#9a3412" },
  { kind: "expense", name: "Contas e serviços", background_color: "#e0f2fe", text_color: "#075985" },
  { kind: "expense", name: "Educação", background_color: "#ede9fe", text_color: "#5b21b6" },
  { kind: "expense", name: "Lazer", background_color: "#dcfce7", text_color: "#166534" },
  { kind: "expense", name: "Moradia", background_color: "#dbeafe", text_color: "#1e3a8a" },
  { kind: "expense", name: "Outros", background_color: "#f3f4f6", text_color: "#374151" },
  { kind: "expense", name: "Saúde", background_color: "#fce7f3", text_color: "#9d174d" },
  { kind: "expense", name: "Transporte", background_color: "#e0e7ff", text_color: "#3730a3" },
  { kind: "income", name: "Freelance", background_color: "#ccfbf1", text_color: "#115e59" },
  { kind: "income", name: "Investimentos", background_color: "#ecfccb", text_color: "#3f6212" },
  { kind: "income", name: "Outros", background_color: "#f3f4f6", text_color: "#374151" },
  { kind: "income", name: "Salário", background_color: "#d1fae5", text_color: "#065f46" },
];

const pets = { kind: "expense", name: "Pets", background_color: "#fde68a", text_color: "#78350f" };

describe("categorias", () => {
  let userA: TestUser;
  let userB: TestUser;

  beforeAll(async () => {
    userA = await createTestUser("a");
    userB = await createTestUser("b");
  });

  afterAll(async () => {
    await deleteTestUser(userA);
    await deleteTestUser(userB);
  });

  async function categoriesOf(user: TestUser) {
    const { data, error } = await user.client
      .from("categories")
      .select("kind, name, background_color, text_color")
      .order("kind")
      .order("name");
    if (error) throw error;
    return data;
  }

  describe("categorias padrão", () => {
    it("todo usuário novo recebe as 13 categorias padrão com as cores da tabela", async () => {
      expect(await categoriesOf(userA)).toEqual(DEFAULT_CATEGORIES);
    });

    it("não são chamáveis pela API: a função fica fora do schema public", async () => {
      const { error } = await userB.client.rpc("create_default_categories", {
        target_user_id: userA.id,
      });
      expect(error).not.toBeNull();
      expect(await categoriesOf(userA)).toHaveLength(13);
    });
  });

  describe("regras do banco", () => {
    afterEach(async () => {
      await userA.client.from("categories").delete().eq("name", "Pets");
    });

    it("aceita uma categoria nova válida", async () => {
      const { error } = await userA.client.from("categories").insert(pets);
      expect(error).toBeNull();
    });

    it("rejeita nome repetido no mesmo tipo, sem diferenciar maiúsculas", async () => {
      await userA.client.from("categories").insert(pets);
      const { error } = await userA.client.from("categories").insert({ ...pets, name: "pets" });
      expect(error?.code).toBe("23505");
    });

    it("aceita o mesmo nome em tipos diferentes", async () => {
      const outros = (await categoriesOf(userA)).filter((category) => category.name === "Outros");
      expect(outros.map((category) => category.kind)).toEqual(["expense", "income"]);
    });

    it.each(["#FDE68A", "#fde68", "azul", "#fde68aa"])("rejeita a cor %p", async (color) => {
      const { error } = await userA.client
        .from("categories")
        .insert({ ...pets, background_color: color });
      expect(error?.code).toBe("23514");
    });

    it.each(["", " Pets", "x".repeat(31)])("rejeita o nome %p", async (name) => {
      const { error } = await userA.client.from("categories").insert({ ...pets, name });
      expect(error?.code).toBe("23514");
    });
  });

  describe("isolamento entre usuários (RLS)", () => {
    it("B não vê as categorias de A", async () => {
      const { data } = await userB.client.from("categories").select("user_id");
      expect(data?.every((row) => row.user_id === userB.id)).toBe(true);
      expect(data).toHaveLength(13);
    });

    it("B não altera nem apaga categorias de A", async () => {
      const updated = await userB.client
        .from("categories")
        .update({ name: "Invadida" })
        .eq("user_id", userA.id)
        .select("id");
      const deleted = await userB.client
        .from("categories")
        .delete()
        .eq("user_id", userA.id)
        .select("id");
      expect(updated.data).toEqual([]);
      expect(deleted.data).toEqual([]);
      expect(await categoriesOf(userA)).toEqual(DEFAULT_CATEGORIES);
    });

    it("B não cria categoria em nome de A", async () => {
      const { error } = await userB.client
        .from("categories")
        .insert({ ...pets, user_id: userA.id });
      expect(error?.code).toBe("42501");
    });

    it("visitante sem sessão não lê nem grava", async () => {
      const visitor = anonymousClient();
      expect((await visitor.from("categories").select("id")).data).toEqual([]);
      expect((await visitor.from("categories").insert(pets)).error).not.toBeNull();
    });
  });
});
