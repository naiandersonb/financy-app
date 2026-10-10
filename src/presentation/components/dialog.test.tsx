import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

function renderDialog({
  showCloseButton,
  showFooterClose,
}: {
  showCloseButton?: boolean;
  showFooterClose?: boolean;
} = {}) {
  render(
    <Dialog>
      <DialogTrigger>Abrir</DialogTrigger>
      <DialogContent showCloseButton={showCloseButton}>
        <DialogHeader>
          <DialogTitle>Título</DialogTitle>
          <DialogDescription>Descrição</DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton={showFooterClose}>
          <DialogClose>Cancelar</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  );
}

async function openAndCloseWith(buttonName: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Abrir" }));
  expect(await screen.findByRole("dialog", { name: "Título" })).toHaveAccessibleDescription(
    "Descrição",
  );
  await user.click(screen.getByRole("button", { name: buttonName }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
}

describe("Dialog", () => {
  it("o botão X é anunciado em português e fecha o diálogo", async () => {
    renderDialog();
    await openAndCloseWith("Fechar");
  });

  it("o rodapé pode ter um botão Fechar", async () => {
    renderDialog({ showCloseButton: false, showFooterClose: true });
    await openAndCloseWith("Fechar");
  });

  it("sem os botões automáticos, o diálogo fecha pelo botão próprio", async () => {
    renderDialog({ showCloseButton: false });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    await screen.findByRole("dialog");
    expect(screen.queryByRole("button", { name: "Fechar" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
