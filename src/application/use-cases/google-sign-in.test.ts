/** @jest-environment node */
import { FakeAuthGateway } from "../testing/fake-auth-gateway";
import { completeOAuthSignIn } from "./complete-oauth-sign-in";
import { startGoogleSignIn } from "./start-google-sign-in";

describe("startGoogleSignIn", () => {
  it("pede ao provedor o retorno em /auth/callback da URL do app e devolve a URL do Google", async () => {
    const auth = new FakeAuthGateway();
    const result = await startGoogleSignIn(auth, "http://localhost:3000");

    expect(auth.lastOAuthRequest).toEqual({
      provider: "google",
      redirectTo: "http://localhost:3000/auth/callback",
    });
    expect(result.ok && result.value).toMatch(/^https:\/\/accounts\.google\.com\//);
  });

  it("falha sem expor o erro técnico", async () => {
    const auth = new FakeAuthGateway();
    auth.failNextOAuth = true;
    expect(await startGoogleSignIn(auth, "http://localhost:3000")).toEqual({
      ok: false,
      error: "oauth_start_failed",
    });
  });
});

describe("completeOAuthSignIn", () => {
  let auth: FakeAuthGateway;

  beforeEach(() => {
    auth = new FakeAuthGateway();
    auth.validOAuthCodes.set("code-ok", "user-google");
  });

  it("cria a sessão e vai para / por padrão", async () => {
    const result = await completeOAuthSignIn(auth, { code: "code-ok", next: null, error: null });
    expect(result).toEqual({ ok: true, value: "/" });
    expect((await auth.currentUser())?.id).toBe("user-google");
  });

  it("respeita um next interno", async () => {
    const result = await completeOAuthSignIn(auth, {
      code: "code-ok",
      next: "/categories",
      error: null,
    });
    expect(result).toEqual({ ok: true, value: "/categories" });
  });

  it.each(["https://site-malicioso.com", "//site-malicioso.com"])(
    "ignora next externo (%s) e vai para /",
    async (next) => {
      const result = await completeOAuthSignIn(auth, { code: "code-ok", next, error: null });
      expect(result).toEqual({ ok: true, value: "/" });
    },
  );

  it("falha sem sessão quando o usuário cancelou no Google", async () => {
    const result = await completeOAuthSignIn(auth, {
      code: null,
      next: null,
      error: "access_denied",
    });
    expect(result.ok).toBe(false);
    expect(await auth.currentUser()).toBeNull();
  });

  it("falha quando o code está ausente", async () => {
    const result = await completeOAuthSignIn(auth, { code: null, next: null, error: null });
    expect(result).toEqual({ ok: false, error: "oauth_cancelled_or_missing_code" });
  });

  it("falha sem sessão quando o code é inválido", async () => {
    const result = await completeOAuthSignIn(auth, { code: "forjado", next: null, error: null });
    expect(result).toEqual({ ok: false, error: "oauth_exchange_failed" });
    expect(await auth.currentUser()).toBeNull();
  });
});
