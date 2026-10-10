import { render, screen } from "@testing-library/react";
import { MonthNavigator } from "./month-navigator";

describe("MonthNavigator", () => {
  it("mostra o mês por extenso como título", () => {
    render(<MonthNavigator month="2026-10" currentMonth="2026-10" />);
    expect(screen.getByRole("heading", { level: 1, name: "Outubro de 2026" })).toBeInTheDocument();
  });

  it("aponta as setas para o mês anterior e o próximo, atravessando o ano", () => {
    render(<MonthNavigator month="2027-01" currentMonth="2026-10" />);
    expect(
      screen.getByRole("link", { name: "Mês anterior: Dezembro de 2026" }),
    ).toHaveAttribute("href", "/?month=2026-12");
    expect(
      screen.getByRole("link", { name: "Próximo mês: Fevereiro de 2027" }),
    ).toHaveAttribute("href", "/?month=2027-02");
  });

  it("mostra o atalho para o mês atual só quando está em outro mês", () => {
    const { rerender } = render(<MonthNavigator month="2026-08" currentMonth="2026-10" />);
    expect(screen.getByRole("link", { name: "Mês atual" })).toHaveAttribute("href", "/");

    rerender(<MonthNavigator month="2026-10" currentMonth="2026-10" />);
    expect(screen.queryByRole("link", { name: "Mês atual" })).not.toBeInTheDocument();
  });
});
