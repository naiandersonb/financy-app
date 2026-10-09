import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KindSelector } from "./kind-selector";

describe("KindSelector", () => {
  it("marca o tipo recebido e envia o valor no campo kind", () => {
    render(
      <form aria-label="teste">
        <KindSelector value="income" onChange={jest.fn()} />
      </form>,
    );
    expect(screen.getByRole("group", { name: "Tipo" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Receita" })).toBeChecked();
    const form = screen.getByRole("form", { name: "teste" }) as HTMLFormElement;
    expect(new FormData(form).get("kind")).toBe("income");
  });

  it("avisa quando o usuário escolhe outro tipo", async () => {
    const onChange = jest.fn();
    render(<KindSelector value="expense" onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole("radio", { name: "Receita" }));
    expect(onChange).toHaveBeenCalledWith("income");
  });
});
