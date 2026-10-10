/** @jest-environment node */
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseAuthGateway } from "./supabase-auth-gateway";

function gatewayWith(auth: Record<string, jest.Mock>) {
  return new SupabaseAuthGateway({ auth } as unknown as SupabaseClient);
}

const credentials = { email: "ana@exemplo.com", password: "123456" };

describe("SupabaseAuthGateway", () => {
  describe("signIn", () => {
    it("tem sucesso quando o Supabase não retorna erro", async () => {
      const signInWithPassword = jest.fn().mockResolvedValue({ error: null });
      const result = await gatewayWith({ signInWithPassword }).signIn(credentials);
      expect(result.ok).toBe(true);
      expect(signInWithPassword).toHaveBeenCalledWith(credentials);
    });

    it("falha com o código do erro, ou a mensagem quando não há código", async () => {
      const withCode = gatewayWith({
        signInWithPassword: jest.fn().mockResolvedValue({
          error: { code: "invalid_credentials", message: "Invalid" },
        }),
      });
      const withoutCode = gatewayWith({
        signInWithPassword: jest.fn().mockResolvedValue({ error: { message: "Invalid" } }),
      });
      expect(await withCode.signIn(credentials)).toEqual({ ok: false, error: "invalid_credentials" });
      expect(await withoutCode.signIn(credentials)).toEqual({ ok: false, error: "Invalid" });
    });
  });

  describe("signUp", () => {
    it("informa que o usuário já entrou quando há sessão", async () => {
      const signUp = jest.fn().mockResolvedValue({ data: { session: {} }, error: null });
      expect(await gatewayWith({ signUp }).signUp(credentials)).toEqual({
        ok: true,
        value: "signed-in",
      });
    });

    it("informa que falta confirmar o e-mail quando não há sessão", async () => {
      const signUp = jest.fn().mockResolvedValue({ data: { session: null }, error: null });
      expect(await gatewayWith({ signUp }).signUp(credentials)).toEqual({
        ok: true,
        value: "confirmation-required",
      });
    });

    it("falha com o código ou a mensagem do erro", async () => {
      const withCode = gatewayWith({
        signUp: jest.fn().mockResolvedValue({ data: {}, error: { code: "user_already_exists", message: "x" } }),
      });
      const withoutCode = gatewayWith({
        signUp: jest.fn().mockResolvedValue({ data: {}, error: { message: "x" } }),
      });
      expect(await withCode.signUp(credentials)).toEqual({ ok: false, error: "user_already_exists" });
      expect(await withoutCode.signUp(credentials)).toEqual({ ok: false, error: "x" });
    });
  });

  describe("signOut", () => {
    it("encerra a sessão", async () => {
      const signOut = jest.fn().mockResolvedValue({ error: null });
      await gatewayWith({ signOut }).signOut();
      expect(signOut).toHaveBeenCalled();
    });

    it("lança erro preservando a causa", async () => {
      const cause = { message: "network" };
      const signOut = jest.fn().mockResolvedValue({ error: cause });
      await expect(gatewayWith({ signOut }).signOut()).rejects.toMatchObject({
        message: "Falha ao encerrar a sessão.",
        cause,
      });
    });
  });

  describe("startOAuthSignIn", () => {
    it("pede o OAuth com o redirectTo e devolve a URL do provedor", async () => {
      const signInWithOAuth = jest.fn().mockResolvedValue({
        data: { provider: "google", url: "https://accounts.google.com/o/oauth2/auth?x=1" },
        error: null,
      });
      const result = await gatewayWith({ signInWithOAuth }).startOAuthSignIn(
        "google",
        "http://localhost:3000/auth/callback",
      );

      expect(result).toEqual({ ok: true, value: "https://accounts.google.com/o/oauth2/auth?x=1" });
      expect(signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: { redirectTo: "http://localhost:3000/auth/callback" },
      });
    });

    it("falha com o código ou a mensagem do erro", async () => {
      const withCode = gatewayWith({
        signInWithOAuth: jest.fn().mockResolvedValue({ data: {}, error: { code: "provider_disabled", message: "x" } }),
      });
      const withoutCode = gatewayWith({
        signInWithOAuth: jest.fn().mockResolvedValue({ data: {}, error: { message: "x" } }),
      });
      expect(await withCode.startOAuthSignIn("google", "r")).toEqual({ ok: false, error: "provider_disabled" });
      expect(await withoutCode.startOAuthSignIn("google", "r")).toEqual({ ok: false, error: "x" });
    });
  });

  describe("completeOAuthSignIn", () => {
    it("troca o code por sessão", async () => {
      const exchangeCodeForSession = jest.fn().mockResolvedValue({ data: {}, error: null });
      expect(await gatewayWith({ exchangeCodeForSession }).completeOAuthSignIn("abc")).toEqual({
        ok: true,
        value: undefined,
      });
      expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    });

    it("falha com o código ou a mensagem do erro", async () => {
      const withCode = gatewayWith({
        exchangeCodeForSession: jest.fn().mockResolvedValue({ error: { code: "bad_code_verifier", message: "x" } }),
      });
      const withoutCode = gatewayWith({
        exchangeCodeForSession: jest.fn().mockResolvedValue({ error: { message: "x" } }),
      });
      expect(await withCode.completeOAuthSignIn("abc")).toEqual({ ok: false, error: "bad_code_verifier" });
      expect(await withoutCode.completeOAuthSignIn("abc")).toEqual({ ok: false, error: "x" });
    });
  });

  describe("currentUser", () => {
    it("retorna id e e-mail das claims validadas", async () => {
      const getClaims = jest.fn().mockResolvedValue({
        data: { claims: { sub: "user-1", email: "ana@exemplo.com" } },
        error: null,
      });
      expect(await gatewayWith({ getClaims }).currentUser()).toEqual({
        id: "user-1",
        email: "ana@exemplo.com",
        name: null,
        avatarUrl: null,
      });
    });

    it.each([
      [{ full_name: "Ana Souza" }, "Ana Souza"],
      [{ name: "  Ana  " }, "Ana"],
      [{ full_name: "   " }, null],
      [{ full_name: 42 }, null],
    ])("lê o nome do user_metadata %p", async (metadata, expected) => {
      const getClaims = jest.fn().mockResolvedValue({
        data: { claims: { sub: "user-1", user_metadata: metadata } },
        error: null,
      });
      expect((await gatewayWith({ getClaims }).currentUser())?.name).toBe(expected);
    });

    it.each([
      [{ avatar_url: "https://lh3.googleusercontent.com/a/foto" }, "https://lh3.googleusercontent.com/a/foto"],
      [{ picture: "https://lh3.googleusercontent.com/a/foto-2" }, "https://lh3.googleusercontent.com/a/foto-2"],
      [{ avatar_url: "" }, null],
      [{ avatar_url: 42 }, null],
    ])("lê a foto do user_metadata %p", async (metadata, expected) => {
      const getClaims = jest.fn().mockResolvedValue({
        data: { claims: { sub: "user-1", user_metadata: metadata } },
        error: null,
      });
      expect((await gatewayWith({ getClaims }).currentUser())?.avatarUrl).toBe(expected);
    });

    it("retorna e-mail nulo quando a conta não tem e-mail nas claims", async () => {
      const getClaims = jest.fn().mockResolvedValue({ data: { claims: { sub: "user-1" } }, error: null });
      expect(await gatewayWith({ getClaims }).currentUser()).toEqual({
        id: "user-1",
        email: null,
        name: null,
        avatarUrl: null,
      });
    });

    it.each([
      [{ data: null, error: { message: "expired" } }],
      [{ data: null, error: null }],
    ])("retorna null sem sessão válida (%p)", async (response) => {
      const getClaims = jest.fn().mockResolvedValue(response);
      expect(await gatewayWith({ getClaims }).currentUser()).toBeNull();
    });
  });
});
