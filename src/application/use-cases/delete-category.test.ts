/** @jest-environment node */
import { HOUSING, LEISURE, SALARY, UNKNOWN_CATEGORY_ID } from "../testing/category-fixtures";
import { InMemoryCategoryRepository } from "../testing/in-memory-category-repository";
import { deleteCategory } from "./delete-category";

describe("deleteCategory", () => {
  let repository: InMemoryCategoryRepository;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    repository.items.push({ ...HOUSING }, { ...LEISURE }, { ...SALARY });
  });

  const ids = () => repository.items.map((item) => item.id);

  it("remove uma categoria sem uso", async () => {
    expect(await deleteCategory(repository, LEISURE.id)).toEqual({ ok: true, value: undefined });
    expect(ids()).toEqual([HOUSING.id, SALARY.id]);
  });

  it.each([
    [1, "Esta categoria tem 1 lançamento e não pode ser removida."],
    [3, "Esta categoria tem 3 lançamentos e não pode ser removida."],
  ])("bloqueia com %i lançamento(s), dizendo quantos", async (transactions, start) => {
    repository.usageById.set(LEISURE.id, { transactions, hasBudget: false });
    expect(await deleteCategory(repository, LEISURE.id)).toEqual({
      ok: false,
      error: `${start} Mova os lançamentos para outra categoria antes.`,
    });
    expect(ids()).toContain(LEISURE.id);
  });

  it("bloqueia quando a categoria tem orçamento", async () => {
    repository.usageById.set(LEISURE.id, { transactions: 0, hasBudget: true });
    expect(await deleteCategory(repository, LEISURE.id)).toEqual({
      ok: false,
      error:
        "Esta categoria tem um orçamento definido e não pode ser removida. Remova o orçamento antes.",
    });
  });

  it("bloqueia a última categoria de receita", async () => {
    expect(await deleteCategory(repository, SALARY.id)).toEqual({
      ok: false,
      error: "Mantenha pelo menos uma categoria de receita.",
    });
    expect(ids()).toContain(SALARY.id);
  });

  it("bloqueia a última categoria de despesa", async () => {
    await deleteCategory(repository, LEISURE.id);
    expect(await deleteCategory(repository, HOUSING.id)).toEqual({
      ok: false,
      error: "Mantenha pelo menos uma categoria de despesa.",
    });
  });

  it("avisa quando a categoria passou a ser usada entre a checagem e a remoção", async () => {
    repository.becomesUsedBeforeDelete = true;
    expect(await deleteCategory(repository, LEISURE.id)).toEqual({
      ok: false,
      error: "Esta categoria passou a ser usada e não pode ser removida.",
    });
  });

  it.each([UNKNOWN_CATEGORY_ID, "não-é-uuid"])("recusa id %p", async (id) => {
    expect(await deleteCategory(repository, id)).toEqual({
      ok: false,
      error: "Categoria não encontrada.",
    });
    expect(ids()).toHaveLength(3);
  });
});
