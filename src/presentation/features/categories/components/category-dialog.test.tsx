import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryDialog } from "./category-dialog";

const success = { ok: true as const, value: undefined };

async function openDialog(onSave = jest.fn().mockResolvedValue(success)) {
  const user = userEvent.setup();
  render(<CategoryDialog onSave={onSave} />);
  await user.click(screen.getByRole("button", { name: "Nova categoria" }));
  await screen.findByRole("dialog", { name: "Nova categoria" });
  return { user, onSave };
}

describe("CategoryDialog", () => {
  it("abre com Despesa e as cores padrão", async () => {
    await openDialog();
    expect(screen.getByRole("radio", { name: "Despesa" })).toBeChecked();
    expect(screen.getByLabelText("Cor de fundo")).toHaveValue("#e5e7eb");
    expect(screen.getByLabelText("Cor do texto")).toHaveValue("#1f2937");
  });

  it("envia nome, tipo e cores e fecha quando salva", async () => {
    const { user, onSave } = await openDialog();

    await user.type(screen.getByLabelText("Nome"), "Pets");
    await user.click(screen.getByRole("radio", { name: "Receita" }));
    await user.clear(screen.getByLabelText("Cor de fundo"));
    await user.type(screen.getByLabelText("Cor de fundo"), "#FDE68A");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(Object.fromEntries(onSave.mock.calls[0][1] as FormData)).toEqual({
      name: "Pets",
      kind: "income",
      backgroundColor: "#FDE68A",
      textColor: "#1f2937",
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("mantém o diálogo aberto e mostra o erro do servidor", async () => {
    const { user } = await openDialog(
      jest.fn().mockResolvedValue({ ok: false, error: "Já existe uma categoria com esse nome." }),
    );
    await user.type(screen.getByLabelText("Nome"), "Lazer");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Já existe uma categoria com esse nome.",
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // Os campos mantêm o que o usuário digitou, para ele só corrigir o necessário.
    expect(screen.getByLabelText("Nome")).toHaveValue("Lazer");
  });

  it("indica carregamento enquanto salva", async () => {
    let finish: (value: typeof success) => void = () => {};
    const { user } = await openDialog(
      jest.fn(() => new Promise<typeof success>((resolve) => (finish = resolve))),
    );
    await user.type(screen.getByLabelText("Nome"), "Pets");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(screen.getByRole("button", { name: "Salvando…" })).toBeDisabled();
    finish(success);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("fecha sem salvar ao cancelar", async () => {
    const { user, onSave } = await openDialog();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(onSave).not.toHaveBeenCalled();
  });

  describe("prévia", () => {
    function preview() {
      return within(screen.getByRole("group", { name: "Prévia" }));
    }

    it("mostra um nome de exemplo e as cores padrão antes de digitar", async () => {
      await openDialog();
      expect(preview().getByText("Nome da categoria")).toHaveStyle({
        backgroundColor: "#e5e7eb",
        color: "#1f2937",
      });
      expect(preview().getByRole("status")).toHaveTextContent(/Contraste .* — bom/);
    });

    it("acompanha o nome e as cores enquanto o usuário edita", async () => {
      const { user } = await openDialog();
      await user.type(screen.getByLabelText("Nome"), "Pets");
      await user.clear(screen.getByLabelText("Cor de fundo"));
      await user.type(screen.getByLabelText("Cor de fundo"), "#fde68a");
      await user.clear(screen.getByLabelText("Cor do texto"));
      await user.type(screen.getByLabelText("Cor do texto"), "#78350f");

      expect(preview().getByText("Pets")).toHaveStyle({
        backgroundColor: "#fde68a",
        color: "#78350f",
      });
      expect(preview().getByRole("status")).toHaveTextContent("Contraste 7,2:1 — bom");
    });

    it("usa a cor padrão na prévia enquanto o hexadecimal está incompleto", async () => {
      const { user } = await openDialog();
      await user.clear(screen.getByLabelText("Cor de fundo"));
      await user.type(screen.getByLabelText("Cor de fundo"), "#fd");
      expect(preview().getByText("Nome da categoria")).toHaveStyle({ backgroundColor: "#e5e7eb" });
      expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
    });

    it("avisa e desabilita o salvar quando o contraste é baixo", async () => {
      const { user } = await openDialog();
      await user.clear(screen.getByLabelText("Cor de fundo"));
      await user.type(screen.getByLabelText("Cor de fundo"), "#ffffff");
      await user.clear(screen.getByLabelText("Cor do texto"));
      await user.type(screen.getByLabelText("Cor do texto"), "#eeeeee");

      expect(preview().getByRole("status")).toHaveTextContent("Pouco contraste");
      expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
    });
  });
});
