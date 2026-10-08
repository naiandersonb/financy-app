/** @jest-environment node */
import { FakeAuthGateway } from "../testing/fake-auth-gateway";
import { InMemoryBudgetRepository } from "../testing/in-memory-budget-repository";
import { deleteBudget } from "./delete-budget";
import { listBudgets } from "./list-budgets";
import { saveBudget } from "./save-budget";

describe("budgets", () => {
  let auth: FakeAuthGateway;
  let budgets: InMemoryBudgetRepository;

  beforeEach(() => {
    auth = new FakeAuthGateway();
    auth.sessionUserId = "user-1";
    budgets = new InMemoryBudgetRepository("user-1");
  });

  it("salva o limite em centavos para o usuário da sessão e o lista", async () => {
    const result = await saveBudget({ budgets, auth }, { category: "Lazer", limit: "400" });
    expect(result.ok).toBe(true);
    expect(await listBudgets(budgets)).toEqual([{ category: "Lazer", limitCents: 40_000 }]);
  });

  it("substitui o limite existente da mesma categoria", async () => {
    await saveBudget({ budgets, auth }, { category: "Lazer", limit: "400" });
    await saveBudget({ budgets, auth }, { category: "Lazer", limit: "500" });
    expect(await listBudgets(budgets)).toEqual([{ category: "Lazer", limitCents: 50_000 }]);
  });

  it.each([
    [{ category: "Salário", limit: "100" }, "Escolha uma categoria de despesa."],
    [{ category: "Lazer", limit: "0" }, "Informe um limite maior que zero."],
    [{ limit: "10" }, "Escolha uma categoria de despesa."],
  ])("recusa %p", async (input, message) => {
    expect(await saveBudget({ budgets, auth }, input)).toEqual({ ok: false, error: message });
    expect(await listBudgets(budgets)).toEqual([]);
  });

  it("recusa quando a sessão expirou", async () => {
    auth.sessionUserId = null;
    const result = await saveBudget({ budgets, auth }, { category: "Lazer", limit: "400" });
    expect(result).toEqual({ ok: false, error: "Sua sessão expirou. Entre novamente." });
  });

  it("remove o orçamento da categoria", async () => {
    await saveBudget({ budgets, auth }, { category: "Lazer", limit: "400" });
    await deleteBudget(budgets, "Lazer");
    expect(await listBudgets(budgets)).toEqual([]);
  });
});
