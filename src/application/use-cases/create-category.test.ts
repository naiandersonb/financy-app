/** @jest-environment node */
import { InMemoryCategoryRepository } from "../testing/in-memory-category-repository";
import { createCategory } from "./create-category";

const pets = {
  kind: "expense",
  name: "  Pets  ",
  backgroundColor: "#FDE68A",
  textColor: "#78350F",
};

describe("createCategory", () => {
  let repository: InMemoryCategoryRepository;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
  });

  it("cria a categoria com nome sem espaços nas pontas e cores em minúsculas", async () => {
    expect(await createCategory(repository, pets)).toEqual({ ok: true, value: undefined });
    expect(repository.items).toEqual([
      { id: "c-1", kind: "expense", name: "Pets", backgroundColor: "#fde68a", textColor: "#78350f" },
    ]);
  });

  it("recusa nome repetido no mesmo tipo, sem diferenciar maiúsculas", async () => {
    await createCategory(repository, pets);
    expect(await createCategory(repository, { ...pets, name: "pets" })).toEqual({
      ok: false,
      error: "Já existe uma categoria com esse nome.",
    });
    expect(repository.items).toHaveLength(1);
  });

  it("aceita o mesmo nome em outro tipo", async () => {
    await createCategory(repository, { ...pets, name: "Outros" });
    const result = await createCategory(repository, { ...pets, name: "Outros", kind: "income" });
    expect(result.ok).toBe(true);
  });

  it.each([
    [{ name: "" }, "Informe um nome com até 30 caracteres."],
    [{ name: "   " }, "Informe um nome com até 30 caracteres."],
    [{ name: "x".repeat(31) }, "Informe um nome com até 30 caracteres."],
    [{ kind: "transfer" }, "Escolha se é receita ou despesa."],
    [{ backgroundColor: "#12345" }, "Informe uma cor de fundo válida (ex.: #e5e7eb)."],
    [{ backgroundColor: "azul" }, "Informe uma cor de fundo válida (ex.: #e5e7eb)."],
    [{ textColor: undefined }, "Informe uma cor de texto válida (ex.: #1f2937)."],
    [
      { backgroundColor: "#ffffff", textColor: "#eeeeee" },
      "Pouco contraste: o nome pode ficar difícil de ler.",
    ],
  ])("recusa %p sem criar", async (override, message) => {
    expect(await createCategory(repository, { ...pets, ...override })).toEqual({
      ok: false,
      error: message,
    });
    expect(repository.items).toHaveLength(0);
  });

  it("aceita nome com exatamente 30 caracteres", async () => {
    const result = await createCategory(repository, { ...pets, name: "x".repeat(30) });
    expect(result.ok).toBe(true);
  });

  it("recusa a 51ª categoria", async () => {
    for (let index = 0; index < 50; index++) {
      await createCategory(repository, { ...pets, name: `Categoria ${index}` });
    }
    expect(await createCategory(repository, pets)).toEqual({
      ok: false,
      error: "Limite de 50 categorias atingido.",
    });
    expect(repository.items).toHaveLength(50);
  });
});
