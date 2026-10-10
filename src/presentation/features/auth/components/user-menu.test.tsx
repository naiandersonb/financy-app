import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenu } from "./user-menu";

describe("UserMenu", () => {
  it("mostra o e-mail do usuário", () => {
    render(<UserMenu name={null} avatarUrl={null} email="ana@exemplo.com" onSignOut={jest.fn()} />);
    expect(screen.getByText("ana@exemplo.com")).toBeInTheDocument();
  });

  it("omite o e-mail quando a conta não tem um", () => {
    render(<UserMenu name={null} avatarUrl={null} email={null} onSignOut={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
  });

  it("chama a ação de sair e indica carregamento enquanto sai", async () => {
    const user = userEvent.setup();
    let finish: () => void = () => {};
    const onSignOut = jest.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(<UserMenu name={null} avatarUrl={null} email="ana@exemplo.com" onSignOut={onSignOut} />);

    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(onSignOut).toHaveBeenCalled();
    expect(await screen.findByRole("button", { name: "Saindo…" })).toBeDisabled();
    finish();
    expect(await screen.findByRole("button", { name: "Sair" })).toBeEnabled();
  });

  it("mostra o avatar ao lado do e-mail", () => {
    const { container } = render(
      <UserMenu
        name={null}
        email="ana@exemplo.com"
        avatarUrl="https://lh3.googleusercontent.com/a/foto"
        onSignOut={jest.fn()}
      />,
    );
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("mostra o nome em destaque e o e-mail abaixo quando há nome", () => {
    render(
      <UserMenu name="Ana Souza" email="ana@exemplo.com" avatarUrl={null} onSignOut={jest.fn()} />,
    );
    expect(screen.getByText("Ana Souza")).toHaveClass("font-medium");
    expect(screen.getByText("ana@exemplo.com")).toHaveClass("text-xs");
  });
});
