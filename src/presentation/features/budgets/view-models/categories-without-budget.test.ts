/** @jest-environment node */
import type { Category } from "@/domain";
import { categoriesWithoutBudget } from "./categories-without-budget";

function category(id: string, kind: Category["kind"], name: string): Category {
  return { id, kind, name, backgroundColor: "#ffffff", textColor: "#000000" };
}

describe("categoriesWithoutBudget", () => {
  it("devolve só categorias de despesa sem orçamento, em ordem alfabética", () => {
    const result = categoriesWithoutBudget(
      [
        category("c-saude", "expense", "Saúde"),
        category("c-lazer", "expense", "Lazer"),
        category("c-alimentacao", "expense", "Alimentação"),
        category("c-salario", "income", "Salário"),
      ],
      [{ categoryId: "c-lazer" }],
    );
    expect(result.map((item) => item.name)).toEqual(["Alimentação", "Saúde"]);
  });

  it("devolve lista vazia quando todas as despesas já têm orçamento", () => {
    expect(
      categoriesWithoutBudget([category("c-lazer", "expense", "Lazer")], [{ categoryId: "c-lazer" }]),
    ).toEqual([]);
  });
});
