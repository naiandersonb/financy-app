import { render } from "@testing-library/react";
import { UserAvatar } from "./user-avatar";

describe("UserAvatar", () => {
  it("mostra a foto do Google como imagem decorativa", () => {
    const { container } = render(
      <UserAvatar name={null} email="ana@exemplo.com" avatarUrl="https://lh3.googleusercontent.com/a/foto" />,
    );
    const image = container.querySelector("img");
    expect(image).toHaveAttribute("alt", "");
    expect(decodeURIComponent(image?.getAttribute("src") ?? "")).toContain(
      "https://lh3.googleusercontent.com/a/foto",
    );
  });

  it("mostra a inicial do e-mail quando não há foto", () => {
    const { container } = render(<UserAvatar name={null} email="ana@exemplo.com" avatarUrl={null} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container).toHaveTextContent("A");
  });

  it("não carrega imagem de host não permitido", () => {
    const { container } = render(
      <UserAvatar name={null} email="bia@exemplo.com" avatarUrl="https://rastreador.exemplo.com/pixel.png" />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container).toHaveTextContent("B");
  });

  it("mostra ? quando também não há e-mail", () => {
    const { container } = render(<UserAvatar name={null} email={null} avatarUrl={null} />);
    expect(container).toHaveTextContent("?");
  });

  it("usa a inicial do nome quando há nome", () => {
    const { container } = render(
      <UserAvatar name="Carla Dias" email="ana@exemplo.com" avatarUrl={null} />,
    );
    expect(container).toHaveTextContent("C");
  });
});
