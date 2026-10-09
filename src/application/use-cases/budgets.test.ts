/** @jest-environment node */
import { LEISURE, SALARY, UNKNOWN_CATEGORY_ID } from "../testing/category-fixtures";
import { FakeAuthGateway } from "../testing/fake-auth-gateway";
import { InMemoryCategoryRepository } from "../testing/in-memory-category-repository";
import { InMemoryBudgetRepository } from "../testing/in-memory-budget-repository";
import { deleteBudget } from "./delete-budget";
import { listBudgets } from "./list-budgets";
import { saveBudget } from "./save-budget";

describe("budgets", () => {
  let auth: FakeAuthGateway;
  let budgets: InMemoryBudgetRepository;
  let categories: InMemoryCategoryRepository;

  beforeEach(() => {
    auth = new FakeAuthGateway();
    auth.sessionUserId = "user-1";
    budgets = new InMemoryBudgetRepository("user-1");
    categories = new InMemoryCategoryRepository();
    categories.items.push(LEISURE, SALARY);
  });

  it("salva o limite em centavos para o usuário da sessão e o lista", async () => {
    const result = await saveBudget({ budgets, categories, auth }, { categoryId: LEISURE.id, limit: "400" });
    expect(result.ok).toBe(true);
    expect(await listBudgets(budgets)).toEqual([{ categoryId: LEISURE.id, limitCents: 40_000 }]);
  });

  it("substitui o limite existente da mesma categoria", async () => {
    await saveBudget({ budgets, categories, auth }, { categoryId: LEISURE.id, limit: "400" });
    await saveBudget({ budgets, categories, auth }, { categoryId: LEISURE.id, limit: "500" });
    expect(await listBudgets(budgets)).toEqual([{ categoryId: LEISURE.id, limitCents: 50_000 }]);
  });

  it.each([
    [{ categoryId: SALARY.id, limit: "100" }, "Escolha uma categoria de despesa."],
    [{ categoryId: UNKNOWN_CATEGORY_ID, limit: "100" }, "Escolha uma categoria de despesa."],
    [{ categoryId: LEISURE.id, limit: "0" }, "Informe um limite maior que zero."],
    [{ limit: "10" }, "Escolha uma categoria de despesa."],
  ])("recusa %p", async (input, message) => {
    expect(await saveBudget({ budgets, categories, auth }, input)).toEqual({ ok: false, error: message });
    expect(await listBudgets(budgets)).toEqual([]);
  });

  it("recusa quando a sessão expirou", async () => {
    auth.sessionUserId = null;
    const result = await saveBudget({ budgets, categories, auth }, { categoryId: LEISURE.id, limit: "400" });
    expect(result).toEqual({ ok: false, error: "Sua sessão expirou. Entre novamente." });
  });

  it("remove o orçamento da categoria", async () => {
    await saveBudget({ budgets, categories, auth }, { categoryId: LEISURE.id, limit: "400" });
    await deleteBudget(budgets, LEISURE.id);
    expect(await listBudgets(budgets)).toEqual([]);
  });
});
