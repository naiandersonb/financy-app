import { render, screen } from "@testing-library/react";
import type { BudgetStatus, Category } from "@/domain";
import { BudgetItem } from "./budget-item";

const leisure: Category = {
  id: "c-lazer",
  kind: "expense",
  name: "Lazer",
  backgroundColor: "#dcfce7",
  textColor: "#166534",
};

function status(spentCents: number, state: BudgetStatus["state"]): BudgetStatus {
  return {
    categoryId: leisure.id,
    limitCents: 40_000,
    spentCents,
    remainingCents: 40_000 - spentCents,
    usage: spentCents / 40_000,
    state,
  };
}

function renderItem(item: BudgetStatus, category: Category | undefined) {
  return render(
    <ul>
      <BudgetItem status={item} category={category} />
    </ul>,
  );
}

describe("BudgetItem", () => {
  it("dentro do limite: gasto de limite, 'Restam', percentual e barra primária", () => {
    const { container } = renderItem(status(10_000, "ok"), leisure);
    const item = screen.getByRole("listitem");
    expect(item).toHaveTextContent(/R\$\s100,00\s*de R\$\s400,00/);
    expect(item).toHaveTextContent(/Restam R\$\s300,00/);
    expect(item).toHaveTextContent(/25\s?%/);
    expect(screen.getByRole("progressbar", { name: "Uso do orçamento de Lazer" })).toHaveAttribute(
      "aria-valuenow",
      "25",
    );
    expect(container.querySelector("[data-slot=progress]")).toHaveClass(
      "[&_[data-slot=progress-indicator]]:bg-primary",
    );
  });

  it("em atenção: barra âmbar", () => {
    const { container } = renderItem(status(34_000, "warning"), leisure);
    expect(container.querySelector("[data-slot=progress]")).toHaveClass(
      "[&_[data-slot=progress-indicator]]:bg-amber-500",
    );
    expect(screen.getByRole("listitem")).toHaveTextContent(/85\s?%/);
  });

  it("estourado: barra vermelha cheia e 'Excedeu'", () => {
    const { container } = renderItem(status(45_000, "over"), leisure);
    expect(screen.getByRole("listitem")).toHaveTextContent(/Excedeu R\$\s50,00/);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    expect(container.querySelector("[data-slot=progress]")).toHaveClass(
      "[&_[data-slot=progress-indicator]]:bg-destructive",
    );
  });

  it("indica quando a categoria não está na lista recebida", () => {
    renderItem(status(0, "ok"), undefined);
    expect(screen.getByText("Sem categoria")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Uso do orçamento de Sem categoria" })).toBeInTheDocument();
  });
});
