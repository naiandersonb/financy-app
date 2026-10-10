import { render, screen, within } from "@testing-library/react";
import type { Category } from "@/domain";
import { CategoryBreakdown } from "./category-breakdown";

const food: Category = {
  id: "c-alimentacao",
  kind: "expense",
  name: "Alimentação",
  backgroundColor: "#fef3c7",
  textColor: "#78350f",
};
const leisure: Category = {
  id: "c-lazer",
  kind: "expense",
  name: "Lazer",
  backgroundColor: "#dcfce7",
  textColor: "#166534",
};

function section() {
  return within(screen.getByRole("region", { name: "Gastos por categoria" }));
}

describe("CategoryBreakdown", () => {
  it("mostra selo, valor e percentual de cada categoria, na ordem recebida", () => {
    render(
      <CategoryBreakdown
        categories={[food, leisure]}
        spending={[
          { categoryId: food.id, spentCents: 30_000, shareOfExpenses: 0.75 },
          { categoryId: leisure.id, spentCents: 10_000, shareOfExpenses: 0.25 },
        ]}
      />,
    );
    const rows = section().getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent(/Alimentação\s*R\$\s300,00\s*75\s?%/);
    expect(rows[1]).toHaveTextContent(/Lazer\s*R\$\s100,00\s*25\s?%/);
    expect(within(rows[0]).getByText("Alimentação")).toHaveStyle({ backgroundColor: "#fef3c7" });
  });

  it("desenha a barra proporcional ao percentual, escondida de leitores de tela", () => {
    const { container } = render(
      <CategoryBreakdown
        categories={[food]}
        spending={[{ categoryId: food.id, spentCents: 30_000, shareOfExpenses: 0.75 }]}
      />,
    );
    const bar = container.querySelector('[aria-hidden="true"] > div') as HTMLElement;
    expect(bar).toHaveStyle({ width: "75%" });
  });

  it("arredonda o percentual para inteiro só na exibição", () => {
    render(
      <CategoryBreakdown
        categories={[food]}
        spending={[{ categoryId: food.id, spentCents: 1, shareOfExpenses: 1 / 3 }]}
      />,
    );
    expect(section().getByRole("listitem")).toHaveTextContent(/33\s?%/);
  });

  it("mostra o estado vazio quando não há despesas", () => {
    render(<CategoryBreakdown categories={[food]} spending={[]} />);
    expect(section().getByText("Nenhuma despesa neste mês.")).toBeInTheDocument();
  });

  it("indica quando a categoria não está na lista recebida", () => {
    render(
      <CategoryBreakdown
        categories={[]}
        spending={[{ categoryId: "c-x", spentCents: 100, shareOfExpenses: 1 }]}
      />,
    );
    expect(section().getByText("Sem categoria")).toBeInTheDocument();
  });
});
