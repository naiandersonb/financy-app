import { fail, succeed, type Result } from "@/shared";
import type {
  AuthGateway,
  Credentials,
  CurrentUser,
  OAuthProvider,
  SignUpOutcome,
} from "../ports/auth-gateway";

export class FakeAuthGateway implements AuthGateway {
  readonly accounts = new Map<string, string>();
  sessionUserId: string | null = null;
  signUpOutcome: SignUpOutcome = "signed-in";
  failNextSignUp = false;
  failNextOAuth = false;
  /** Códigos OAuth que o fake aceita e o usuário que cada um autentica. */
  readonly validOAuthCodes = new Map<string, string>();
  lastOAuthRequest: { provider: OAuthProvider; redirectTo: string } | null = null;

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

  async startOAuthSignIn(provider: OAuthProvider, redirectTo: string): Promise<Result<string>> {
    if (this.failNextOAuth) return fail("provider_disabled");
    this.lastOAuthRequest = { provider, redirectTo };
    return succeed(`https://accounts.google.com/o/oauth2/auth?redirect_to=${redirectTo}`);
  }

  async completeOAuthSignIn(code: string): Promise<Result> {
    const userId = this.validOAuthCodes.get(code);
    if (!userId) return fail("invalid_grant");
    this.sessionUserId = userId;
    return succeed();
  }

  /** Na sessão falsa, o id do usuário é o próprio e-mail. */
  async currentUser(): Promise<CurrentUser | null> {
    return this.sessionUserId ? { id: this.sessionUserId, email: this.sessionUserId } : null;
  }
}
