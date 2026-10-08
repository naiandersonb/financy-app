import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Transaction } from "@/domain";
import { TransactionDialog } from "./transaction-dialog";

const success = { ok: true as const, value: undefined };

const existing: Transaction = {
  id: "abc",
  kind: "income",
  description: "Salário de outubro",
  amountCents: 500_000,
  category: "Salário",
  occurredOn: "2026-10-05",
};

function categoryOptions() {
  return Array.from(
    (screen.getByLabelText("Categoria") as HTMLSelectElement).options,
    (option) => option.value,
  );
}

describe("TransactionDialog", () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 9, 8), advanceTimers: true });
  });

  afterEach(() => jest.useRealTimers());

  it("abre o formulário de novo lançamento com padrões de despesa e data de hoje", async () => {
    const user = userEvent.setup();
    render(<TransactionDialog month="2026-10" onSave={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "Novo lançamento" }));

    expect(await screen.findByRole("dialog", { name: "Novo lançamento" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Despesa" })).toBeChecked();
    expect(screen.getByLabelText("Data")).toHaveValue("2026-10-08");
    expect(categoryOptions()[0]).toBe("Moradia");
  });

  it("usa o dia 1º quando o mês exibido não é o atual", async () => {
    const user = userEvent.setup();
    render(<TransactionDialog month="2026-08" onSave={jest.fn()} />);
    await user.click(screen.getByRole("button", { name: "Novo lançamento" }));
    expect(await screen.findByLabelText("Data")).toHaveValue("2026-08-01");
  });

  it("troca as categorias quando o tipo muda", async () => {
    const user = userEvent.setup();
    render(<TransactionDialog month="2026-10" onSave={jest.fn()} />);
    await user.click(screen.getByRole("button", { name: "Novo lançamento" }));

    await user.click(await screen.findByRole("radio", { name: "Receita" }));

    expect(screen.getByRole("radio", { name: "Receita" })).toBeChecked();
    expect(categoryOptions()).toEqual(["Salário", "Freelance", "Investimentos", "Outros"]);
    expect(screen.getByLabelText("Categoria")).toHaveValue("Salário");
  });

  it("envia o formulário e fecha o diálogo quando salva", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn().mockResolvedValue(success);
    render(<TransactionDialog month="2026-10" onSave={onSave} />);
    await user.click(screen.getByRole("button", { name: "Novo lançamento" }));

    await user.type(await screen.findByLabelText("Descrição"), "Supermercado");
    await user.type(screen.getByLabelText("Valor (R$)"), "150.5");
    await user.selectOptions(screen.getByLabelText("Categoria"), "Alimentação");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    const formData: FormData = onSave.mock.calls[0][1];
    expect(Object.fromEntries(formData)).toEqual({
      kind: "expense",
      description: "Supermercado",
      amount: "150.5",
      occurredOn: "2026-10-08",
      category: "Alimentação",
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("mantém o diálogo aberto e mostra o erro quando não salva", async () => {
    const user = userEvent.setup();
    const onSave = jest
      .fn()
      .mockResolvedValue({ ok: false, error: "Não foi possível salvar o lançamento." });
    render(<TransactionDialog month="2026-10" onSave={onSave} />);
    await user.click(screen.getByRole("button", { name: "Novo lançamento" }));

    await user.type(await screen.findByLabelText("Descrição"), "Supermercado");
    await user.type(screen.getByLabelText("Valor (R$)"), "10");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível salvar o lançamento.",
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("indica carregamento enquanto salva", async () => {
    const user = userEvent.setup();
    let finish: (value: typeof success) => void = () => {};
    render(
      <TransactionDialog
        month="2026-10"
        onSave={() => new Promise((resolve) => (finish = resolve))}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Novo lançamento" }));
    await user.type(await screen.findByLabelText("Descrição"), "Supermercado");
    await user.type(screen.getByLabelText("Valor (R$)"), "10");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(screen.getByRole("button", { name: "Salvando…" })).toBeDisabled();
    finish(success);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("edita um lançamento com os campos preenchidos e envia o id", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn().mockResolvedValue(success);
    render(<TransactionDialog month="2026-10" onSave={onSave} transaction={existing} />);

    await user.click(screen.getByRole("button", { name: "Editar lançamento" }));

    expect(await screen.findByRole("dialog", { name: "Editar lançamento" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Receita" })).toBeChecked();
    expect(screen.getByLabelText("Descrição")).toHaveValue("Salário de outubro");
    expect(screen.getByLabelText("Valor (R$)")).toHaveValue(5000);
    expect(screen.getByLabelText("Data")).toHaveValue("2026-10-05");
    expect(screen.getByLabelText("Categoria")).toHaveValue("Salário");

    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect((onSave.mock.calls[0][1] as FormData).get("id")).toBe("abc");
  });

  it("ao trocar o tipo na edição, volta para a primeira categoria do novo tipo", async () => {
    const user = userEvent.setup();
    render(<TransactionDialog month="2026-10" onSave={jest.fn()} transaction={existing} />);
    await user.click(screen.getByRole("button", { name: "Editar lançamento" }));

    await user.click(await screen.findByRole("radio", { name: "Despesa" }));

    expect(screen.getByLabelText("Categoria")).toHaveValue("Moradia");
  });
});
