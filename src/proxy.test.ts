/** @jest-environment node */
import { NextRequest, NextResponse } from "next/server";
import { refreshSessionAndGuard } from "@/infrastructure";
import { config, proxy } from "./proxy";

jest.mock("@/infrastructure", () => ({ refreshSessionAndGuard: jest.fn() }));

describe("proxy", () => {
  it("delega a renovação de sessão e a proteção de rotas", async () => {
    const response = NextResponse.next();
    jest.mocked(refreshSessionAndGuard).mockResolvedValue(response);
    const request = new NextRequest("http://localhost:3000/");

    expect(await proxy(request)).toBe(response);
    expect(refreshSessionAndGuard).toHaveBeenCalledWith(request);
  });

  it("não roda em arquivos estáticos", () => {
    const [pattern] = config.matcher;
    const matches = (path: string) => new RegExp(`^${pattern}$`).test(path);
    expect(matches("/")).toBe(true);
    expect(matches("/login")).toBe(true);
    expect(matches("/_next/static/chunk.js")).toBe(false);
    expect(matches("/favicon.ico")).toBe(false);
    expect(matches("/logo.png")).toBe(false);
  });
});
