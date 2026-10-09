import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoogleSignInButton } from "./google-sign-in-button";

describe("GoogleSignInButton", () => {
  it("chama a ação e indica o redirecionamento enquanto ela roda", async () => {
    let finish: () => void = () => {};
    const onGoogleSignIn = jest.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(<GoogleSignInButton onGoogleSignIn={onGoogleSignIn} />);

    await userEvent.setup().click(screen.getByRole("button", { name: "Continuar com Google" }));

    expect(onGoogleSignIn).toHaveBeenCalled();
    expect(await screen.findByRole("button", { name: "Redirecionando…" })).toBeDisabled();
    finish();
    expect(await screen.findByRole("button", { name: "Continuar com Google" })).toBeEnabled();
  });
});
