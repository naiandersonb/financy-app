import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Category } from "@/domain";
import { DeleteCategoryButton } from "./delete-category-button";

const leisure: Category = {
  id: "c-lazer",
  kind: "expense",
  name: "Lazer",
  backgroundColor: "#dcfce7",
  textColor: "#166534",
};
const success = { ok: true as const, value: undefined };

async function openConfirmation(onDelete = jest.fn().mockResolvedValue(success)) {
  const user = userEvent.setup();
  render(<DeleteCategoryButton category={leisure} onDelete={onDelete} />);
  await user.click(screen.getByRole("button", { name: "Remover categoria Lazer" }));
  await screen.findByRole("dialog", { name: "Remover categoria?" });
  return { user, onDelete };
}

describe("DeleteCategoryButton", () => {
  it("pede confirmação mostrando a categoria", async () => {
    await openConfirmation();
    expect(screen.getByRole("dialog")).toHaveTextContent("Lazer");
    expect(screen.getByRole("dialog")).toHaveTextContent("não pode ser desfeita");
  });

  it("não remove ao cancelar", async () => {
    const { user, onDelete } = await openConfirmation();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("remove ao confirmar e fecha", async () => {
    const { user, onDelete } = await openConfirmation();
    await user.click(screen.getByRole("button", { name: "Remover" }));
    expect(onDelete).toHaveBeenCalledWith("c-lazer");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("mantém a janela aberta com o motivo quando a remoção é bloqueada", async () => {
    const { user } = await openConfirmation(
      jest.fn().mockResolvedValue({
        ok: false,
        error: "Esta categoria tem 2 lançamentos e não pode ser removida.",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Remover" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("tem 2 lançamentos");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("limpa o erro ao fechar e reabrir", async () => {
    const { user } = await openConfirmation(
      jest.fn().mockResolvedValue({ ok: false, error: "Bloqueada." }),
    );
    await user.click(screen.getByRole("button", { name: "Remover" }));
    await screen.findByRole("alert");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Remover categoria Lazer" }));
    await screen.findByRole("dialog");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("indica carregamento enquanto remove", async () => {
    let finish: (value: typeof success) => void = () => {};
    const { user } = await openConfirmation(
      jest.fn(() => new Promise<typeof success>((resolve) => (finish = resolve))),
    );
    await user.click(screen.getByRole("button", { name: "Remover" }));
    expect(await screen.findByRole("button", { name: "Removendo…" })).toBeDisabled();
    finish(success);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
