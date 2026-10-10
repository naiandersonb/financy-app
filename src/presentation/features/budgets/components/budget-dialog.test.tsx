import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Category } from "@/domain";
import { BudgetDialog } from "./budget-dialog";

function category(id: string, name: string, backgroundColor = "#f3f4f6"): Category {
  return { id, kind: "expense", name, backgroundColor, textColor: "#374151" };
}

const available = [category("c-alimentacao", "Alimentação"), category("c-saude", "Saúde", "#fce7f3")];
const success = { ok: true as const, value: undefined };

async function openDialog(onSave = jest.fn().mockResolvedValue(success)) {
  const user = userEvent.setup();
  render(<BudgetDialog categories={available} onSave={onSave} />);
  await user.click(screen.getByRole("button", { name: "Definir limite" }));
  await screen.findByRole("dialog", { name: "Definir limite" });
  return { user, onSave };
}

function categoryOptions() {
  return Array.from(
    (screen.getByLabelText("Categoria") as HTMLSelectElement).options,
    (option) => option.textContent,
  );
}

describe("BudgetDialog", () => {
  it("lista só as categorias recebidas, começando pela primeira", async () => {
    await openDialog();
    expect(categoryOptions()).toEqual(["Alimentação", "Saúde"]);
    expect(screen.getByLabelText("Categoria")).toHaveValue("c-alimentacao");
  });

  it("mostra o selo da categoria escolhida", async () => {
    const { user } = await openDialog();
    await user.selectOptions(screen.getByLabelText("Categoria"), "Saúde");
    expect(screen.getByText("Saúde", { selector: "span" })).toHaveStyle({ backgroundColor: "#fce7f3" });
  });

  it("envia categoria e limite e fecha quando salva", async () => {
    const { user, onSave } = await openDialog();
    await user.selectOptions(screen.getByLabelText("Categoria"), "Saúde");
    await user.type(screen.getByLabelText("Limite mensal (R$)"), "400");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(Object.fromEntries(onSave.mock.calls[0][1] as FormData)).toEqual({
      categoryId: "c-saude",
      limit: "400",
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("mantém os campos e mostra o erro do servidor", async () => {
    const { user } = await openDialog(
      jest.fn().mockResolvedValue({ ok: false, error: "Não foi possível salvar o orçamento." }),
    );
    await user.selectOptions(screen.getByLabelText("Categoria"), "Saúde");
    await user.type(screen.getByLabelText("Limite mensal (R$)"), "10");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível salvar o orçamento.",
    );
    expect(screen.getByLabelText("Categoria")).toHaveValue("c-saude");
    expect(screen.getByLabelText("Limite mensal (R$)")).toHaveValue(10);
  });

  it("indica carregamento enquanto salva", async () => {
    let finish: (value: typeof success) => void = () => {};
    const { user } = await openDialog(
      jest.fn(() => new Promise<typeof success>((resolve) => (finish = resolve))),
    );
    await user.type(screen.getByLabelText("Limite mensal (R$)"), "100");
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(screen.getByRole("button", { name: "Salvando…" })).toBeDisabled();
    finish(success);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("abre sem categoria escolhida nem selo quando a lista está vazia", async () => {
    const user = userEvent.setup();
    render(<BudgetDialog categories={[]} onSave={jest.fn()} />);
    await user.click(screen.getByRole("button", { name: "Definir limite" }));
    await screen.findByRole("dialog");
    expect((screen.getByLabelText("Categoria") as HTMLSelectElement).value).toBe("");
    expect(categoryOptions()).toEqual([]);
  });
});
