import { render, screen, within } from "@testing-library/react";
import { SummaryCards } from "./summary-cards";

function card(label: string) {
  const item = within(screen.getByRole("list", { name: "Resumo do mês" }))
    .getAllByRole("listitem")
    .find((element) => element.textContent?.startsWith(label));
  if (!item) throw new Error(`Cartão ${label} não encontrado`);
  return { item, value: item.lastElementChild as HTMLElement };
}

describe("SummaryCards", () => {
  it("mostra receitas, despesas e saldo positivo em verde", () => {
    render(
      <SummaryCards
        summary={{ incomeCents: 500_000, expenseCents: 320_050, balanceCents: 179_950 }}
      />,
    );
    expect(card("Receitas").value).toHaveTextContent(/R\$\s5\.000,00/);
    expect(card("Despesas").value).toHaveTextContent(/R\$\s3\.200,50/);
    expect(card("Saldo").value).toHaveTextContent(/^R\$\s1\.799,50$/);
    expect(card("Saldo").value).toHaveClass("text-emerald-700");
  });

  it("mostra saldo negativo com sinal de menos e em vermelho", () => {
    render(<SummaryCards summary={{ incomeCents: 100, expenseCents: 15_100, balanceCents: -15_000 }} />);
    expect(card("Saldo").value).toHaveTextContent(/− R\$\s150,00/);
    expect(card("Saldo").value).toHaveClass("text-destructive");
  });

  it("mostra R$ 0,00 nos três cartões num mês sem lançamentos, com saldo zero como positivo", () => {
    render(<SummaryCards summary={{ incomeCents: 0, expenseCents: 0, balanceCents: 0 }} />);
    for (const label of ["Receitas", "Despesas", "Saldo"]) {
      expect(card(label).value).toHaveTextContent(/^R\$\s0,00$/);
    }
    expect(card("Saldo").value).toHaveClass("text-emerald-700");
  });
});
