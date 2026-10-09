import { render, screen, within } from "@testing-library/react";
import type { Category } from "@/domain";
import { CategoryList } from "./category-list";

function category(kind: Category["kind"], name: string): Category {
  return { id: `${kind}-${name}`, kind, name, backgroundColor: "#f3f4f6", textColor: "#374151" };
}

describe("CategoryList", () => {
  it("mostra as categorias em seções de Despesas e Receitas, em ordem alfabética", () => {
    render(
      <CategoryList onUpdate={jest.fn()}
        categories={[
          category("expense", "Moradia"),
          category("income", "Salário"),
          category("expense", "Alimentação"),
          category("income", "Outros"),
          category("expense", "Outros"),
        ]}
      />,
    );

    const expenses = within(screen.getByRole("region", { name: "Despesas" }));
    const incomes = within(screen.getByRole("region", { name: "Receitas" }));
    expect(expenses.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Alimentação",
      "Moradia",
      "Outros",
    ]);
    expect(incomes.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Outros",
      "Salário",
    ]);
  });

  it("avisa quando um tipo não tem categorias", () => {
    render(<CategoryList onUpdate={jest.fn()} categories={[category("expense", "Moradia")]} />);
    const incomes = within(screen.getByRole("region", { name: "Receitas" }));
    expect(incomes.getByText("Nenhuma categoria.")).toBeInTheDocument();
  });

  it("oferece editar cada categoria", () => {
    render(
      <CategoryList
        onUpdate={jest.fn()}
        categories={[category("expense", "Moradia"), category("income", "Salário")]}
      />,
    );
    expect(screen.getByRole("button", { name: "Editar categoria Moradia" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar categoria Salário" })).toBeInTheDocument();
  });
});
