/** @jest-environment node */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "./server-client";

jest.mock("./env", () => ({
  supabaseUrl: "https://exemplo.supabase.co",
  supabasePublishableKey: "sb_publishable_teste",
}));
jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("@supabase/ssr", () => ({ createServerClient: jest.fn(() => ({ fake: "client" })) }));

type CookieMethods = {
  getAll: () => unknown;
  setAll: (cookies: { name: string; value: string; options: object }[]) => void;
};

function cookieMethodsPassedToSupabase(): CookieMethods {
  const options = jest.mocked(createServerClient).mock.calls[0][2] as { cookies: CookieMethods };
  return options.cookies;
}

describe("createSupabaseServerClient", () => {
  const cookieStore = { getAll: jest.fn(() => [{ name: "sb", value: "1" }]), set: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(cookies).mockResolvedValue(cookieStore as never);
  });

  it("cria o cliente com a URL e a chave pública e lê os cookies da requisição", async () => {
    const client = await createSupabaseServerClient();

    expect(client).toEqual({ fake: "client" });
    expect(createServerClient).toHaveBeenCalledWith(
      "https://exemplo.supabase.co",
      "sb_publishable_teste",
      expect.any(Object),
    );
    expect(cookieMethodsPassedToSupabase().getAll()).toEqual([{ name: "sb", value: "1" }]);
  });

  it("grava os cookies renovados pelo Supabase", async () => {
    await createSupabaseServerClient();
    cookieMethodsPassedToSupabase().setAll([{ name: "sb", value: "2", options: { path: "/" } }]);
    expect(cookieStore.set).toHaveBeenCalledWith("sb", "2", { path: "/" });
  });

  it("não quebra em Server Components, onde gravar cookies é proibido", async () => {
    cookieStore.set.mockImplementationOnce(() => {
      throw new Error("Cookies can only be modified in a Server Action or Route Handler");
    });
    await createSupabaseServerClient();
    expect(() =>
      cookieMethodsPassedToSupabase().setAll([{ name: "sb", value: "2", options: {} }]),
    ).not.toThrow();
  });
});
