import { render, screen } from "@testing-library/react";
import { ContrastIndicator } from "./contrast-indicator";

describe("ContrastIndicator", () => {
  it("mostra a razão com uma casa decimal quando o contraste é bom", () => {
    render(<ContrastIndicator backgroundColor="#fde68a" textColor="#78350f" />);
    expect(screen.getByRole("status")).toHaveTextContent("Contraste 7,2:1 — bom");
  });

  it("avisa quando o contraste é baixo", () => {
    render(<ContrastIndicator backgroundColor="#ffffff" textColor="#eeeeee" />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Pouco contraste (1,1:1): o nome pode ficar difícil de ler.",
    );
  });

  it("nunca arredonda um contraste reprovado para 4,5:1", () => {
    // #777777 sobre branco dá 4,48:1: reprovado, exibido como 4,4.
    render(<ContrastIndicator backgroundColor="#ffffff" textColor="#777777" />);
    expect(screen.getByRole("status")).toHaveTextContent("Pouco contraste (4,4:1)");
  });

  it("pede cores válidas enquanto alguma está incompleta", () => {
    render(<ContrastIndicator backgroundColor="#fde" textColor="#78350f" />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Informe as duas cores no formato #rrggbb.",
    );
  });
});
