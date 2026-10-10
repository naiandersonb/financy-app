import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Category, Transaction } from "@/domain";
import { TransactionList } from "./transaction-list";

const housing: Category = {
  id: "c-moradia",
  kind: "expense",
  name: "Moradia",
  backgroundColor: "#dbeafe",
  textColor: "#1e3a8a",
};
const salary: Category = {
  id: "c-salario",
  kind: "income",
  name: "Salário",
  backgroundColor: "#d1fae5",
  textColor: "#065f46",
};

function transaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: "t-1",
    kind: "expense",
    description: "Aluguel",
    amountCents: 150_000,
    categoryId: housing.id,
    occurredOn: "2026-10-01",
    ...overrides,
  };
}

describe("TransactionList", () => {
  it("mostra data, descrição, selo da categoria e valor com sinal, na ordem recebida", () => {
    render(
      <TransactionList month="2026-10" onUpdate={jest.fn()}
        categories={[housing, salary]}
        transactions={[
          transaction({
            id: "t-2",
            kind: "income",
            description: "Salário de outubro",
            amountCents: 500_000,
            categoryId: salary.id,
            occurredOn: "2026-10-05",
          }),
          transaction({ id: "t-1" }),
        ]}
      />,
    );

    const rows = within(screen.getByRole("list", { name: "Lançamentos do mês" })).getAllByRole(
      "listitem",
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("05 de out");
    expect(rows[0]).toHaveTextContent("Salário de outubro");
    expect(rows[0]).toHaveTextContent(/\+ R\$\s5\.000,00/);
    expect(rows[1]).toHaveTextContent("01 de out");
    expect(rows[1]).toHaveTextContent(/\u2212 R\$\s1\.500,00/);
    expect(within(rows[1]).getByText("Moradia")).toHaveStyle({
      backgroundColor: "#dbeafe",
      color: "#1e3a8a",
    });
  });

  it("marca a data em formato de máquina", () => {
    render(<TransactionList month="2026-10" onUpdate={jest.fn()} categories={[housing]} transactions={[transaction({})]} />);
    expect(screen.getByText("01 de out")).toHaveAttribute("datetime", "2026-10-01");
  });

  it("mostra o estado vazio quando o mês não tem lançamentos", () => {
    render(<TransactionList month="2026-10" onUpdate={jest.fn()} categories={[housing]} transactions={[]} />);
    expect(screen.getByText("Nenhum lançamento neste mês.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("indica quando a categoria não está na lista recebida", () => {
    render(
      <TransactionList month="2026-10" onUpdate={jest.fn()} categories={[]} transactions={[transaction({ categoryId: "c-x" })]} />,
    );
    expect(screen.getByText("Sem categoria")).toBeInTheDocument();
  });

  it("abre a edição do lançamento da linha, preenchida, e envia o id", async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn().mockResolvedValue({ ok: true, value: undefined });
    render(
      <TransactionList
        month="2026-10"
        onUpdate={onUpdate}
        categories={[housing, salary]}
        transactions={[transaction({ id: "t-9", description: "Aluguel", amountCents: 150_000 })]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Editar lançamento Aluguel" }));
    await screen.findByRole("dialog", { name: "Editar lançamento" });
    expect(screen.getByLabelText("Descrição")).toHaveValue("Aluguel");

    await user.clear(screen.getByLabelText("Valor (R$)"));
    await user.type(screen.getByLabelText("Valor (R$)"), "1600");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    const sent = Object.fromEntries(onUpdate.mock.calls[0][1] as FormData);
    expect(sent).toMatchObject({ id: "t-9", amount: "1600" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
