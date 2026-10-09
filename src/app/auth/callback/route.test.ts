/** @jest-environment node */
import { NextRequest } from "next/server";
import { makeCompleteOAuthSignIn } from "@/main";
import { GET } from "./route";

jest.mock("@/main", () => ({
  makeCompleteOAuthSignIn: jest.fn(),
  siteUrl: "https://financas.exemplo.com",
}));

function callback(query: string, host = "localhost:3000") {
  return new NextRequest(`http://${host}/auth/callback${query}`);
}

describe("GET /auth/callback", () => {
  it("repassa code, next e error ao caso de uso", async () => {
    const useCase = jest.fn().mockResolvedValue({ ok: true, value: "/" });
    jest.mocked(makeCompleteOAuthSignIn).mockResolvedValue(useCase);

    await GET(callback("?code=abc&next=%2Fcategories"));

    expect(useCase).toHaveBeenCalledWith({ code: "abc", next: "/categories", error: null });
  });

  it("redireciona para o destino usando a URL do app, não o Host da requisição", async () => {
    jest.mocked(makeCompleteOAuthSignIn).mockResolvedValue(
      jest.fn().mockResolvedValue({ ok: true, value: "/categories" }),
    );
    const response = await GET(callback("?code=abc", "host-forjado.com"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://financas.exemplo.com/categories");
  });

  it("volta para /login?error=google quando falha", async () => {
    jest.mocked(makeCompleteOAuthSignIn).mockResolvedValue(
      jest.fn().mockResolvedValue({ ok: false, error: "oauth_exchange_failed" }),
    );
    const response = await GET(callback("?error=access_denied"));

    expect(response.headers.get("location")).toBe("https://financas.exemplo.com/login?error=google");
  });
});
