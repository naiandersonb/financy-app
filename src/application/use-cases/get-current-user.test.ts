/** @jest-environment node */
import { FakeAuthGateway } from "../testing/fake-auth-gateway";
import { getCurrentUser } from "./get-current-user";

describe("getCurrentUser", () => {
  it("retorna o usuário da sessão", async () => {
    const auth = new FakeAuthGateway();
    auth.sessionUserId = "ana@exemplo.com";
    auth.name = "Ana Souza";
    auth.avatarUrl = "https://lh3.googleusercontent.com/a/foto";
    expect(await getCurrentUser(auth)).toEqual({
      id: "ana@exemplo.com",
      email: "ana@exemplo.com",
      name: "Ana Souza",
      avatarUrl: "https://lh3.googleusercontent.com/a/foto",
    });
  });

  it("retorna null sem sessão", async () => {
    expect(await getCurrentUser(new FakeAuthGateway())).toBeNull();
  });
});
