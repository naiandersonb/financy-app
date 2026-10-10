/** @jest-environment node */
import { spendingByCategory } from "./category-spending";
import { makeTransaction } from "./testing/make-transaction";

const categories = [
  { id: "cat-alimentacao", name: "Alimentação" },
  { id: "cat-lazer", name: "Lazer" },
  { id: "cat-saude", name: "Saúde" },
  { id: "cat-educacao", name: "educação" },
];

describe("spendingByCategory", () => {
  it("retorna lista vazia sem despesas", () => {
    expect(spendingByCategory([makeTransaction({ kind: "income" })], categories)).toEqual([]);
  });

  it("agrupa despesas por categoria, ordena pelo maior gasto e calcula a fatia", () => {
    const spending = spendingByCategory(
      [
        makeTransaction({ categoryId: "cat-lazer", amountCents: 10_000 }),
        makeTransaction({ categoryId: "cat-alimentacao", amountCents: 20_000 }),
        makeTransaction({ categoryId: "cat-alimentacao", amountCents: 10_000 }),
        makeTransaction({ kind: "income", categoryId: "cat-salario", amountCents: 999_999 }),
      ],
      categories,
    );
    expect(spending).toEqual([
      { categoryId: "cat-alimentacao", spentCents: 30_000, shareOfExpenses: 0.75 },
      { categoryId: "cat-lazer", spentCents: 10_000, shareOfExpenses: 0.25 },
    ]);
  });

  it("desempata pela ordem alfabética do nome, sem que acentos ou maiúsculas mudem a ordem", () => {
    const spending = spendingByCategory(
      [
        makeTransaction({ categoryId: "cat-saude", amountCents: 5_000 }),
        makeTransaction({ categoryId: "cat-lazer", amountCents: 5_000 }),
        makeTransaction({ categoryId: "cat-educacao", amountCents: 5_000 }),
      ],
      categories,
    );
    expect(spending.map((item) => item.categoryId)).toEqual([
      "cat-educacao",
      "cat-lazer",
      "cat-saude",
    ]);
  });

  it("trata categoria desconhecida como nome vazio no desempate", () => {
    const spending = spendingByCategory(
      [
        makeTransaction({ categoryId: "cat-lazer", amountCents: 5_000 }),
        makeTransaction({ categoryId: "cat-x", amountCents: 5_000 }),
      ],
      categories,
    );
    expect(spending.map((item) => item.categoryId)).toEqual(["cat-x", "cat-lazer"]);
  });
});
