/** @jest-environment node */
import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { refreshSessionAndGuard } from "./session-proxy";

jest.mock("./env", () => ({
  supabaseUrl: "https://exemplo.supabase.co",
  supabasePublishableKey: "sb_publishable_teste",
}));
jest.mock("@supabase/ssr", () => ({ createServerClient: jest.fn() }));

type SetAll = (
  cookies: { name: string; value: string; options: object }[],
  headers: Record<string, string>,
) => void;

/** Simula o Supabase: decide se há sessão e, opcionalmente, renova os cookies. */
function mockSession({ authenticated, refresh = false }: { authenticated: boolean; refresh?: boolean }) {
  jest.mocked(createServerClient).mockImplementation((_url, _key, options) => {
    const { setAll } = options.cookies as { setAll: SetAll };
    return {
      auth: {
        getClaims: async () => {
          if (refresh) {
            setAll([{ name: "sb-token", value: "novo", options: { path: "/" } }], {
              "Cache-Control": "private, no-store",
            });
          }
          return { data: authenticated ? { claims: { sub: "user-1" } } : null };
        },
      },
    } as never;
  });
}

function request(path: string) {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

describe("refreshSessionAndGuard", () => {
  it("redireciona visitante sem sessão para /login, sem query string", async () => {
    mockSession({ authenticated: false });
    const response = await refreshSessionAndGuard(request("/?mes=2026-10"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it.each(["/login", "/cadastro"])("deixa visitante sem sessão acessar %s", async (path) => {
    mockSession({ authenticated: false });
    const response = await refreshSessionAndGuard(request(path));
    expect(response.headers.get("location")).toBeNull();
  });

  it("deixa visitante sem sessão acessar subcaminhos de rotas públicas", async () => {
    mockSession({ authenticated: false });
    const response = await refreshSessionAndGuard(request("/login/algo"));
    expect(response.headers.get("location")).toBeNull();
  });

  it.each(["/loginx", "/cadastro-antigo"])(
    "exige sessão em %s, que só começa com o nome de uma rota pública",
    async (path) => {
      mockSession({ authenticated: false });
      const response = await refreshSessionAndGuard(request(path));
      expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    },
  );

  it("deixa usuário logado acessar rotas protegidas", async () => {
    mockSession({ authenticated: true });
    const response = await refreshSessionAndGuard(request("/"));
    expect(response.headers.get("location")).toBeNull();
  });

  it.each(["/login", "/cadastro"])("redireciona usuário logado de %s para /", async (path) => {
    mockSession({ authenticated: true });
    const response = await refreshSessionAndGuard(request(path));
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("repassa cookies e cabeçalhos renovados na resposta", async () => {
    mockSession({ authenticated: true, refresh: true });
    const response = await refreshSessionAndGuard(request("/"));
    expect(response.cookies.get("sb-token")?.value).toBe("novo");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("mantém os cookies renovados também no redirecionamento", async () => {
    mockSession({ authenticated: true, refresh: true });
    const response = await refreshSessionAndGuard(request("/login"));
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
    expect(response.cookies.get("sb-token")?.value).toBe("novo");
  });

  it("lê os cookies da requisição", async () => {
    let getAll: (() => unknown) | undefined;
    jest.mocked(createServerClient).mockImplementation((_url, _key, options) => {
      getAll = (options.cookies as { getAll: () => unknown }).getAll;
      return { auth: { getClaims: async () => ({ data: null }) } } as never;
    });
    const withCookie = request("/login");
    withCookie.cookies.set("sb-token", "atual");
    await refreshSessionAndGuard(withCookie);
    expect(getAll?.()).toEqual([{ name: "sb-token", value: "atual" }]);
  });
});
