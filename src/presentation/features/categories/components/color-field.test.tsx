import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColorField } from "./color-field";

function renderField() {
  render(<ColorField label="Cor de fundo" name="backgroundColor" defaultValue="#e5e7eb" />);
  return {
    hex: screen.getByLabelText("Cor de fundo") as HTMLInputElement,
    picker: screen.getByLabelText("Cor de fundo (seletor)") as HTMLInputElement,
  };
}

describe("ColorField", () => {
  it("começa com o valor padrão nos dois campos", () => {
    const { hex, picker } = renderField();
    expect(hex).toHaveValue("#e5e7eb");
    expect(hex).toHaveAttribute("name", "backgroundColor");
    expect(picker).toHaveValue("#e5e7eb");
  });

  it("atualiza o campo hexadecimal quando o seletor muda", () => {
    const { hex, picker } = renderField();
    fireEvent.input(picker, { target: { value: "#fde68a" } });
    expect(hex).toHaveValue("#fde68a");
  });

  it("atualiza o seletor quando o hexadecimal digitado é válido, mesmo em maiúsculas", async () => {
    const { hex, picker } = renderField();
    const user = userEvent.setup();
    await user.clear(hex);
    await user.type(hex, "#FDE68A");
    expect(picker).toHaveValue("#fde68a");
  });

  it("mantém a última cor válida no seletor enquanto o texto está incompleto", async () => {
    const { hex, picker } = renderField();
    const user = userEvent.setup();
    await user.clear(hex);
    await user.type(hex, "#fde");
    expect(hex).toHaveValue("#fde");
    expect(picker).toHaveValue("#e5e7eb");
  });
});
