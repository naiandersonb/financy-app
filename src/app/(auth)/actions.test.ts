/** @jest-environment node */
import { redirect } from "next/navigation";
import { makeSignIn, makeSignOut, makeSignUp } from "@/main";
import { signIn, signOut, signUp } from "./actions";

jest.mock("@/main", () => ({
  makeSignIn: jest.fn(),
  makeSignUp: jest.fn(),
  makeSignOut: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  redirect: jest.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

function formWith(fields: Record<string, string>) {
  const formData = new FormData();
  Object.entries(fields).forEach(([name, value]) => formData.set(name, value));
  return formData;
}

const credentials = { email: "ana@exemplo.com", password: "123456" };

beforeEach(() => jest.clearAllMocks());

describe("signIn", () => {
  it("repassa os campos do formulário e redireciona para / em caso de sucesso", async () => {
    const useCase = jest.fn().mockResolvedValue({ ok: true, value: undefined });
    jest.mocked(makeSignIn).mockResolvedValue(useCase);

    await expect(signIn({}, formWith(credentials))).rejects.toThrow("redirect:/");
    expect(useCase).toHaveBeenCalledWith(credentials);
  });

  it("devolve o erro para o formulário", async () => {
    jest.mocked(makeSignIn).mockResolvedValue(
      jest.fn().mockResolvedValue({ ok: false, error: "E-mail ou senha inválidos." }),
    );
    expect(await signIn({}, formWith(credentials))).toEqual({
      error: "E-mail ou senha inválidos.",
    });
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("signUp", () => {
  it("redireciona para / quando o usuário já entra", async () => {
    jest.mocked(makeSignUp).mockResolvedValue(
      jest.fn().mockResolvedValue({ ok: true, value: "signed-in" }),
    );
    await expect(signUp({}, formWith(credentials))).rejects.toThrow("redirect:/");
  });

  it("avisa para confirmar o e-mail quando necessário", async () => {
    jest.mocked(makeSignUp).mockResolvedValue(
      jest.fn().mockResolvedValue({ ok: true, value: "confirmation-required" }),
    );
    expect(await signUp({}, formWith(credentials))).toEqual({
      notice: "Conta criada! Confirme pelo link enviado ao seu e-mail e depois entre.",
    });
  });

  it("devolve o erro para o formulário", async () => {
    jest.mocked(makeSignUp).mockResolvedValue(
      jest.fn().mockResolvedValue({ ok: false, error: "Senha curta." }),
    );
    expect(await signUp({}, formWith(credentials))).toEqual({ error: "Senha curta." });
  });
});

describe("signOut", () => {
  it("encerra a sessão e redireciona para /login", async () => {
    const useCase = jest.fn().mockResolvedValue(undefined);
    jest.mocked(makeSignOut).mockResolvedValue(useCase);
    await expect(signOut()).rejects.toThrow("redirect:/login");
    expect(useCase).toHaveBeenCalled();
  });
});
