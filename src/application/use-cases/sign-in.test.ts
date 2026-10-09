/** @jest-environment node */
import { FakeAuthGateway } from "../testing/fake-auth-gateway";
import { signIn } from "./sign-in";

describe("signIn", () => {
  let auth: FakeAuthGateway;

  beforeEach(() => {
    auth = new FakeAuthGateway();
    auth.accounts.set("ana@exemplo.com", "segredo123");
  });

  it("entra com credenciais corretas (e-mail com espaços nas pontas)", async () => {
    const result = await signIn(auth, { email: " ana@exemplo.com ", password: "segredo123" });
    expect(result.ok).toBe(true);
    expect((await auth.currentUser())?.id).toBe("ana@exemplo.com");
  });

  it("recusa senha errada com mensagem genérica", async () => {
    const result = await signIn(auth, { email: "ana@exemplo.com", password: "errada" });
    expect(result).toEqual({ ok: false, error: "E-mail ou senha inválidos." });
  });

  it("usa a mesma mensagem para entrada malformada, sem chamar o gateway", async () => {
    const spy = jest.spyOn(auth, "signIn");
    const result = await signIn(auth, { email: "não-é-email", password: "" });
    expect(result).toEqual({ ok: false, error: "E-mail ou senha inválidos." });
    expect(spy).not.toHaveBeenCalled();
  });
});
