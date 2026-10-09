import { fail, succeed, type Result } from "@/shared";
import type {
  AuthGateway,
  Credentials,
  CurrentUser,
  SignUpOutcome,
} from "../ports/auth-gateway";

export class FakeAuthGateway implements AuthGateway {
  readonly accounts = new Map<string, string>();
  sessionUserId: string | null = null;
  signUpOutcome: SignUpOutcome = "signed-in";
  failNextSignUp = false;

  async signIn({ email, password }: Credentials): Promise<Result> {
    if (this.accounts.get(email) !== password) return fail("invalid_credentials");
    this.sessionUserId = email;
    return succeed();
  }

  async signUp({ email, password }: Credentials): Promise<Result<SignUpOutcome>> {
    if (this.failNextSignUp) return fail("user_already_exists");
    this.accounts.set(email, password);
    if (this.signUpOutcome === "signed-in") this.sessionUserId = email;
    return succeed(this.signUpOutcome);
  }

  async signOut(): Promise<void> {
    this.sessionUserId = null;
  }

  /** Na sessão falsa, o id do usuário é o próprio e-mail. */
  async currentUser(): Promise<CurrentUser | null> {
    return this.sessionUserId ? { id: this.sessionUserId, email: this.sessionUserId } : null;
  }
}
