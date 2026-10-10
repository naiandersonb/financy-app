/** @jest-environment node */
import { isAllowedAvatarUrl } from "./avatar-hosts";

describe("isAllowedAvatarUrl", () => {
  it("aceita a foto do Google em HTTPS", () => {
    expect(isAllowedAvatarUrl("https://lh3.googleusercontent.com/a/ACg8oc-foto=s96-c")).toBe(true);
  });

  it.each([
    null,
    "",
    "não é url",
    "http://lh3.googleusercontent.com/a/foto",
    "https://rastreador.exemplo.com/pixel.png",
    "https://lh3.googleusercontent.com.exemplo.com/a/foto",
    "javascript:alert(1)",
  ])("recusa %p", (url) => {
    expect(isAllowedAvatarUrl(url)).toBe(false);
  });
});
