import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDeleteButton } from "./confirm-delete-button";

const success = { ok: true as const, value: undefined };

async function open(onConfirm = jest.fn().mockResolvedValue(success), children?: string) {
  const user = userEvent.setup();
  render(
    <ConfirmDeleteButton
      triggerLabel="Excluir lançamento Aluguel"
      title="Excluir lançamento?"
      description="Essa ação não pode ser desfeita."
      confirmLabel="Excluir"
      pendingLabel="Excluindo…"
      onConfirm={onConfirm}
    >
      {children}
    </ConfirmDeleteButton>,
  );
  await user.click(screen.getByRole("button", { name: "Excluir lançamento Aluguel" }));
  await screen.findByRole("dialog", { name: "Excluir lançamento?" });
  return { user, onConfirm };
}

describe("ConfirmDeleteButton", () => {
  it("mostra título, descrição e o conteúdo que identifica o item", async () => {
    await open(undefined, "Aluguel · R$ 1.500,00");
    expect(screen.getByRole("dialog")).toHaveTextContent("Essa ação não pode ser desfeita.");
    expect(screen.getByRole("dialog")).toHaveTextContent("Aluguel · R$ 1.500,00");
  });

  it("confirma, mostra o carregamento e fecha", async () => {
    let finish: (value: typeof success) => void = () => {};
    const { user, onConfirm } = await open(
      jest.fn(() => new Promise<typeof success>((resolve) => (finish = resolve))),
    );
    await user.click(screen.getByRole("button", { name: "Excluir" }));

    expect(onConfirm).toHaveBeenCalled();
    expect(await screen.findByRole("button", { name: "Excluindo…" })).toBeDisabled();
    finish(success);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("mostra o motivo quando a exclusão é recusada e limpa ao fechar", async () => {
    const { user } = await open(jest.fn().mockResolvedValue({ ok: false, error: "Recusada." }));
    await user.click(screen.getByRole("button", { name: "Excluir" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Recusada.");

    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Excluir lançamento Aluguel" }));
    await screen.findByRole("dialog");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
