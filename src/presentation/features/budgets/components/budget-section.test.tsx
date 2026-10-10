import { render, screen, within } from "@testing-library/react";
import type { BudgetStatus, Category } from "@/domain";
import { BudgetSection } from "./budget-section";

function category(id: string, name: string): Category {
  return { id, kind: "expense", name, backgroundColor: "#f3f4f6", textColor: "#374151" };
}

function status(categoryId: string, state: BudgetStatus["state"]): BudgetStatus {
  const spentCents = { ok: 100, warning: 900, over: 1_500 }[state];
  return {
    categoryId,
    limitCents: 1_000,
    spentCents,
    remainingCents: 1_000 - spentCents,
    usage: spentCents / 1_000,
    state,
  };
}

const categories = [category("c-a", "Lazer"), category("c-b", "Moradia"), category("c-c", "Saúde")];

function section() {
  return within(screen.getByRole("region", { name: "Orçamentos" }));
}

describe("BudgetSection", () => {
  it("mostra os orçamentos na ordem recebida", () => {
    render(
      <BudgetSection
        categories={categories}
        budgets={[status("c-b", "over"), status("c-a", "warning"), status("c-c", "ok")]}
      />,
    );
    expect(section().getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      expect.stringContaining("Moradia"),
      expect.stringContaining("Lazer"),
      expect.stringContaining("Saúde"),
    ]);
  });

  it.each([
    [[status("c-a", "over")], "1 categoria acima do limite"],
    [[status("c-a", "over"), status("c-b", "over")], "2 categorias acima do limite"],
  ])("resume os estouros", (budgets, message) => {
    render(<BudgetSection categories={categories} budgets={budgets} />);
    expect(section().getByRole("status")).toHaveTextContent(message);
  });

  it("não mostra o resumo sem estouros", () => {
    render(<BudgetSection categories={categories} budgets={[status("c-a", "warning")]} />);
    expect(section().queryByRole("status")).not.toBeInTheDocument();
  });

  it("mostra o estado vazio sem limites e as ações no cabeçalho", () => {
    render(
      <BudgetSection categories={categories} budgets={[]} actions={<button>Definir limite</button>} />,
    );
    expect(
      section().getByText("Nenhum limite definido. Defina limites para acompanhar seus gastos."),
    ).toBeInTheDocument();
    expect(section().getByRole("button", { name: "Definir limite" })).toBeInTheDocument();
  });
});
