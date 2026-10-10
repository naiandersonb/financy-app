import { render, screen } from "@testing-library/react";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "./native-select";

function renderSelect(value?: string) {
  return render(
    <form aria-label="teste">
      <NativeSelect aria-label="Categoria" name="categoryId" value={value} onChange={() => {}} size="sm">
        <NativeSelectOptGroup label="Despesas">
          <NativeSelectOption value="a">Alimentação</NativeSelectOption>
          <NativeSelectOption value="m">Moradia</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    </form>,
  );
}

describe("NativeSelect", () => {
  it("renderiza o select com opções e grupo", () => {
    renderSelect("a");
    expect(screen.getByRole("combobox", { name: "Categoria" })).toHaveAttribute("data-size", "sm");
    expect(screen.getByRole("group", { name: "Despesas" })).toBeInTheDocument();
  });

  it("mantém a escolha atual quando o formulário é resetado (o React 19 reseta ao fim da action)", () => {
    const { rerender } = renderSelect("a");
    rerender(
      <form aria-label="teste">
        <NativeSelect aria-label="Categoria" name="categoryId" value="m" onChange={() => {}}>
          <NativeSelectOption value="a">Alimentação</NativeSelectOption>
          <NativeSelectOption value="m">Moradia</NativeSelectOption>
        </NativeSelect>
      </form>,
    );

    (screen.getByRole("form", { name: "teste" }) as HTMLFormElement).reset();

    expect(screen.getByRole("combobox", { name: "Categoria" })).toHaveValue("m");
  });

  it("não interfere num select não controlado", () => {
    render(
      <NativeSelect aria-label="Livre" defaultValue="m">
        <NativeSelectOption value="a">Alimentação</NativeSelectOption>
        <NativeSelectOption value="m">Moradia</NativeSelectOption>
      </NativeSelect>,
    );
    expect(screen.getByRole("combobox", { name: "Livre" })).toHaveValue("m");
  });
});
