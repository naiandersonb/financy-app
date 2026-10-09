import { render, screen } from "@testing-library/react";
import { AppHeader } from "./app-header";

describe("AppHeader", () => {
  it("mostra o nome do app com link para a tela principal", () => {
    render(<AppHeader />);
    expect(screen.getByRole("link", { name: "Finanças" })).toHaveAttribute("href", "/");
  });

  it("tem o link para Categorias na navegação principal", () => {
    render(<AppHeader />);
    const nav = screen.getByRole("navigation", { name: "Principal" });
    expect(nav).toContainElement(screen.getByRole("link", { name: "Categorias" }));
    expect(screen.getByRole("link", { name: "Categorias" })).toHaveAttribute("href", "/categories");
  });

  it("mostra o conteúdo recebido", () => {
    render(
      <AppHeader>
        <span>ana@exemplo.com</span>
      </AppHeader>,
    );
    expect(screen.getByText("ana@exemplo.com")).toBeInTheDocument();
  });
});
