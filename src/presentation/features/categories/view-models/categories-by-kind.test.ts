/** @jest-environment node */
import type { Category } from "@/domain";
import { categoriesByKind } from "./categories-by-kind";

function category(kind: Category["kind"], name: string): Category {
  return { id: `${kind}-${name}`, kind, name, backgroundColor: "#ffffff", textColor: "#000000" };
}

describe("categoriesByKind", () => {
  it("separa por tipo e ordena alfabeticamente sem que acentos ou maiúsculas mudem a ordem", () => {
    const result = categoriesByKind([
      category("expense", "Saúde"),
      category("income", "Salário"),
      category("expense", "educação"),
      category("expense", "Alimentação"),
      category("income", "Freelance"),
      category("expense", "Lazer"),
    ]);

    expect(result.expense.map((item) => item.name)).toEqual([
      "Alimentação",
      "educação",
      "Lazer",
      "Saúde",
    ]);
    expect(result.income.map((item) => item.name)).toEqual(["Freelance", "Salário"]);
  });

  it("devolve listas vazias sem categorias", () => {
    expect(categoriesByKind([])).toEqual({ expense: [], income: [] });
  });
});
