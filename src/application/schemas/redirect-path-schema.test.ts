/** @jest-environment node */
import { redirectPathSchema } from "./redirect-path-schema";

describe("redirectPathSchema", () => {
  it.each(["/", "/categories", "/?month=2026-10", "/a/b"])("mantém o caminho interno %s", (path) => {
    expect(redirectPathSchema.parse(path)).toBe(path);
  });

  it.each([
    "//site-malicioso.com",
    "/\\site-malicioso.com",
    "https://site-malicioso.com",
    "javascript:alert(1)",
    "categories",
    "",
    undefined,
    42,
  ])("troca %p por /", (value) => {
    expect(redirectPathSchema.parse(value)).toBe("/");
  });
});
