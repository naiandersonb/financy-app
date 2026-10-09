/** @jest-environment node */
import { oauthErrorMessage } from "./oauth-error-message";

describe("oauthErrorMessage", () => {
  it("traduz o erro do Google", () => {
    expect(oauthErrorMessage("google")).toBe(
      "Não foi possível entrar com o Google. Tente novamente.",
    );
  });

  it.each([undefined, "outro", ["google"]])("ignora %p", (code) => {
    expect(oauthErrorMessage(code)).toBeUndefined();
  });
});
