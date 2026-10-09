/** @jest-environment node */
import { FakeAuthGateway } from "../testing/fake-auth-gateway";
import { signOut } from "./sign-out";

describe("signOut", () => {
  it("encerra a sessão", async () => {
    const auth = new FakeAuthGateway();
    auth.sessionUserId = "ana@exemplo.com";
    await signOut(auth);
    expect(await auth.currentUser()).toBeNull();
  });
});
