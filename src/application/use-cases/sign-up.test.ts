/** @jest-environment node */
import { FakeAuthGateway } from "../testing/fake-auth-gateway";
import { signUp } from "./sign-up";

describe("signUp", () => {
  let auth: FakeAuthGateway;

  beforeEach(() => {
    auth = new FakeAuthGateway();
  });

  it("cria a conta e informa que o usuário já entrou", async () => {
    const result = await signUp(auth, { email: "ana@exemplo.com", password: "123456" });
    expect(result).toEqual({ ok: true, value: "signed-in" });
  });

  it("informa quando o projeto exige confirmação de e-mail", async () => {
    auth.signUpOutcome = "confirmation-required";
    const result = await signUp(auth, { email: "ana@exemplo.com", password: "123456" });
    expect(result).toEqual({ ok: true, value: "confirmation-required" });
  });

  it("recusa senha com menos de 6 caracteres sem criar conta", async () => {
    const result = await signUp(auth, { email: "ana@exemplo.com", password: "12345" });
    expect(result).toEqual({
      ok: false,
      error: "A senha precisa ter pelo menos 6 caracteres.",
    });
    expect(auth.accounts.size).toBe(0);
  });

  it("recusa e-mail inválido", async () => {
    const result = await signUp(auth, { email: "ana", password: "123456" });
    expect(result).toEqual({ ok: false, error: "Informe um e-mail válido." });
  });

  it("não expõe o erro técnico do provedor", async () => {
    auth.failNextSignUp = true;
    const result = await signUp(auth, { email: "ana@exemplo.com", password: "123456" });
    expect(result).toEqual({
      ok: false,
      error: "Não foi possível criar a conta. Verifique os dados e tente novamente.",
    });
  });
});
