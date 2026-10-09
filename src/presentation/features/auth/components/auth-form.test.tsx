import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm, type AuthFormState } from "./auth-form";

function renderForm(
  action: (previous: AuthFormState, formData: FormData) => Promise<AuthFormState>,
  extra: { initialError?: string; onGoogleSignIn?: () => Promise<void> } = {},
) {
  return render(
    <AuthForm
      title="Entrar"
      description="Acesse sua conta para continuar."
      submitLabel="Entrar"
      action={action}
      passwordAutoComplete="current-password"
      onGoogleSignIn={extra.onGoogleSignIn ?? jest.fn()}
      initialError={extra.initialError}
      alternative={{ prompt: "Não tem uma conta?", linkLabel: "Cadastre-se", href: "/signup" }}
    />,
  );
}

async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("E-mail"), "ana@exemplo.com");
  await user.type(screen.getByLabelText("Senha"), "123456");
  await user.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("AuthForm", () => {
  it("mostra título, campos com autocomplete e link alternativo", () => {
    renderForm(jest.fn());
    expect(screen.getByRole("heading", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Senha")).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByRole("link", { name: "Cadastre-se" })).toHaveAttribute("href", "/signup");
  });

  it("envia e-mail e senha para a ação", async () => {
    const action = jest.fn().mockResolvedValue({});
    renderForm(action);
    await fillAndSubmit();

    const formData: FormData = action.mock.calls[0][1];
    expect(formData.get("email")).toBe("ana@exemplo.com");
    expect(formData.get("password")).toBe("123456");
  });

  it("mostra o erro devolvido pela ação", async () => {
    renderForm(jest.fn().mockResolvedValue({ error: "E-mail ou senha inválidos." }));
    await fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha inválidos.");
  });

  it("mostra o aviso devolvido pela ação", async () => {
    renderForm(jest.fn().mockResolvedValue({ notice: "Confirme seu e-mail." }));
    await fillAndSubmit();
    expect(await screen.findByRole("status")).toHaveTextContent("Confirme seu e-mail.");
  });

  it("oferece o login com Google antes do formulário de e-mail", async () => {
    const onGoogleSignIn = jest.fn().mockResolvedValue(undefined);
    renderForm(jest.fn(), { onGoogleSignIn });

    await userEvent.setup().click(screen.getByRole("button", { name: "Continuar com Google" }));

    expect(onGoogleSignIn).toHaveBeenCalled();
    expect(screen.getByText("ou")).toBeInTheDocument();
  });

  it("mostra o erro recebido de fora do formulário, como o do Google", () => {
    renderForm(jest.fn(), { initialError: "Não foi possível entrar com o Google. Tente novamente." });
    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível entrar com o Google.");
  });

  it("desabilita o botão e indica carregamento enquanto envia", async () => {
    let finish: (state: AuthFormState) => void = () => {};
    renderForm(() => new Promise((resolve) => (finish = resolve)));
    await fillAndSubmit();

    expect(screen.getByRole("button", { name: "Aguarde…" })).toBeDisabled();
    finish({});
    expect(await screen.findByRole("button", { name: "Entrar" })).toBeEnabled();
  });
});
