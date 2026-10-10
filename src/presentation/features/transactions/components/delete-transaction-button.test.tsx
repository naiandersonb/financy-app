import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Transaction } from "@/domain";
import { DeleteTransactionButton } from "./delete-transaction-button";

const rent: Transaction = {
  id: "t-1",
  kind: "expense",
  description: "Aluguel",
  amountCents: 150_000,
  categoryId: "c-moradia",
  occurredOn: "2026-10-01",
};

async function openConfirmation(onDelete = jest.fn().mockResolvedValue({ ok: true, value: undefined })) {
  const user = userEvent.setup();
  render(<DeleteTransactionButton transaction={rent} onDelete={onDelete} />);
  await user.click(screen.getByRole("button", { name: "Excluir lançamento Aluguel" }));
  await screen.findByRole("dialog", { name: "Excluir lançamento?" });
  return { user, onDelete };
}

describe("DeleteTransactionButton", () => {
  it("pede confirmação mostrando descrição e valor", async () => {
    await openConfirmation();
    expect(screen.getByRole("dialog")).toHaveTextContent("Aluguel");
    expect(screen.getByRole("dialog")).toHaveTextContent(/− R\$\s1\.500,00/);
  });

  it("exclui pelo id ao confirmar", async () => {
    const { user, onDelete } = await openConfirmation();
    await user.click(screen.getByRole("button", { name: "Excluir" }));
    expect(onDelete).toHaveBeenCalledWith("t-1");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("não exclui ao cancelar", async () => {
    const { user, onDelete } = await openConfirmation();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(onDelete).not.toHaveBeenCalled();
  });
});
