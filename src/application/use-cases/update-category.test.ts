/** @jest-environment node */
import { HOUSING, LEISURE, SALARY, UNKNOWN_CATEGORY_ID } from "../testing/category-fixtures";
import { InMemoryCategoryRepository } from "../testing/in-memory-category-repository";
import { updateCategory } from "./update-category";

describe("updateCategory", () => {
  let repository: InMemoryCategoryRepository;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    repository.items.push({ ...LEISURE }, { ...HOUSING }, { ...SALARY });
  });

  function leisure() {
    return repository.items.find((item) => item.id === LEISURE.id);
  }

  const changes = {
    id: LEISURE.id,
    name: " Diversão ",
    backgroundColor: "#FDE68A",
    textColor: "#78350F",
  };

  it("renomeia e recolore com nome sem espaços nas pontas e cores em minúsculas", async () => {
    expect(await updateCategory(repository, changes)).toEqual({ ok: true, value: undefined });
    expect(leisure()).toEqual({
      ...LEISURE,
      name: "Diversão",
      backgroundColor: "#fde68a",
      textColor: "#78350f",
    });
  });

  it("nunca muda o tipo, mesmo se a requisição mandar kind", async () => {
    await updateCategory(repository, { ...changes, kind: "income" });
    expect(leisure()?.kind).toBe("expense");
  });

  it("permite manter o mesmo nome (só mudar as cores)", async () => {
    const result = await updateCategory(repository, { ...changes, name: "Lazer" });
    expect(result.ok).toBe(true);
  });

  it("recusa um nome que já existe no mesmo tipo, sem diferenciar maiúsculas", async () => {
    expect(await updateCategory(repository, { ...changes, name: "moradia" })).toEqual({
      ok: false,
      error: "Já existe uma categoria com esse nome.",
    });
    expect(leisure()?.name).toBe("Lazer");
  });

  it("aceita um nome que existe só no outro tipo", async () => {
    const result = await updateCategory(repository, { ...changes, name: "Salário" });
    expect(result.ok).toBe(true);
  });

  it.each([
    [{ id: UNKNOWN_CATEGORY_ID }, "Categoria não encontrada."],
    [{ id: "não-é-uuid" }, "Categoria não encontrada."],
    [{ name: "" }, "Informe um nome com até 30 caracteres."],
    [{ backgroundColor: "azul" }, "Informe uma cor de fundo válida (ex.: #e5e7eb)."],
    [
      { backgroundColor: "#ffffff", textColor: "#eeeeee" },
      "Pouco contraste: o nome pode ficar difícil de ler.",
    ],
  ])("recusa %p sem alterar", async (override, message) => {
    expect(await updateCategory(repository, { ...changes, ...override })).toEqual({
      ok: false,
      error: message,
    });
    expect(leisure()).toEqual(LEISURE);
  });
});
