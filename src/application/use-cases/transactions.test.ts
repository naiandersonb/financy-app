/** @jest-environment node */
import { makeTransaction } from "@/domain/testing/make-transaction";
import { HOUSING, SALARY, UNKNOWN_CATEGORY_ID } from "../testing/category-fixtures";
import { InMemoryCategoryRepository } from "../testing/in-memory-category-repository";
import { InMemoryTransactionRepository } from "../testing/in-memory-transaction-repository";
import { deleteTransaction } from "./delete-transaction";
import { listMonthTransactions } from "./list-month-transactions";
import { saveTransaction } from "./save-transaction";

const validInput = {
  kind: "expense",
  description: "  Supermercado  ",
  amount: "150.5",
  categoryId: HOUSING.id,
  occurredOn: "2026-10-08",
};

describe("listMonthTransactions", () => {
  it("traz só os lançamentos do mês, incluindo o primeiro e o último dia", async () => {
    const repository = new InMemoryTransactionRepository();
    repository.items.push(
      makeTransaction({ id: "set", occurredOn: "2026-09-30" }),
      makeTransaction({ id: "first", occurredOn: "2026-10-01" }),
      makeTransaction({ id: "last", occurredOn: "2026-10-31" }),
      makeTransaction({ id: "nov", occurredOn: "2026-11-01" }),
    );
    const result = await listMonthTransactions(repository, "2026-10");
    expect(result.map((item) => item.id)).toEqual(["first", "last"]);
  });
});

describe("saveTransaction", () => {
  let repository: InMemoryTransactionRepository;
  let deps: { transactions: InMemoryTransactionRepository; categories: InMemoryCategoryRepository };

  beforeEach(() => {
    repository = new InMemoryTransactionRepository();
    const categories = new InMemoryCategoryRepository();
    categories.items.push(HOUSING, SALARY);
    deps = { transactions: repository, categories };
  });

  it("cria um lançamento normalizado e em centavos", async () => {
    const result = await saveTransaction(deps, validInput);
    expect(result.ok).toBe(true);
    expect(repository.items).toEqual([
      {
        id: "t-1",
        kind: "expense",
        description: "Supermercado",
        amountCents: 15_050,
        categoryId: HOUSING.id,
        occurredOn: "2026-10-08",
      },
    ]);
  });

  it("atualiza quando recebe id", async () => {
    repository.items.push(makeTransaction({ id: "abc" }));
    await saveTransaction(deps, { ...validInput, id: "abc", amount: "10" });
    expect(repository.items).toHaveLength(1);
    expect(repository.items[0]).toMatchObject({ id: "abc", amountCents: 1_000 });
  });

  it.each([
    [{ kind: "transfer" }, "Escolha se é receita ou despesa."],
    [{ description: "   " }, "Informe uma descrição com até 120 caracteres."],
    [{ description: "x".repeat(121) }, "Informe uma descrição com até 120 caracteres."],
    [{ amount: "0" }, "Informe um valor maior que zero."],
    [{ amount: "0.001" }, "Informe um valor maior que zero."],
    [{ amount: "-5" }, "Informe um valor maior que zero."],
    [{ amount: "1,50" }, "Informe um valor maior que zero."],
    [{ categoryId: "não-é-uuid" }, "Escolha uma categoria válida."],
    [{ categoryId: SALARY.id }, "Escolha uma categoria válida."],
    [{ categoryId: UNKNOWN_CATEGORY_ID }, "Escolha uma categoria válida."],
    [{ occurredOn: "2026-02-30" }, "Informe uma data válida."],
    [{ occurredOn: undefined }, "Informe uma data válida."],
  ])("recusa %p sem gravar", async (override, message) => {
    const result = await saveTransaction(deps, { ...validInput, ...override });
    expect(result).toEqual({ ok: false, error: message });
    expect(repository.items).toHaveLength(0);
  });

  it("aceita descrição com exatamente 120 caracteres", async () => {
    const result = await saveTransaction(deps, {
      ...validInput,
      description: "x".repeat(120),
    });
    expect(result.ok).toBe(true);
  });
});

describe("deleteTransaction", () => {
  it("remove o lançamento", async () => {
    const repository = new InMemoryTransactionRepository();
    repository.items.push(makeTransaction({ id: "a" }), makeTransaction({ id: "b" }));
    await deleteTransaction(repository, "a");
    expect(repository.items.map((item) => item.id)).toEqual(["b"]);
  });
});
