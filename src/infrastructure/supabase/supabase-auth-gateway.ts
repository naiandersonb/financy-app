import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AuthGateway,
  Credentials,
  CurrentUser,
  OAuthProvider,
  SignUpOutcome,
} from "@/application";
import { fail, succeed, type Result } from "@/shared";

export class SupabaseAuthGateway implements AuthGateway {
  constructor(private readonly client: SupabaseClient) {}

  async signIn(credentials: Credentials): Promise<Result> {
    const { error } = await this.client.auth.signInWithPassword(credentials);
    return error ? fail(error.code ?? error.message) : succeed();
  }

  async signUp(credentials: Credentials): Promise<Result<SignUpOutcome>> {
    const { data, error } = await this.client.auth.signUp(credentials);
    if (error) return fail(error.code ?? error.message);
    // Sem sessão significa que o projeto exige confirmação de e-mail.
    return succeed(data.session ? "signed-in" : "confirmation-required");
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw new Error("Falha ao encerrar a sessão.", { cause: error });
  }

  async startOAuthSignIn(provider: OAuthProvider, redirectTo: string): Promise<Result<string>> {
    // No servidor não há redirecionamento automático: a URL volta para o app redirecionar.
    // O code_verifier do PKCE fica em cookie, gravado pelo cliente de servidor.
    const { data, error } = await this.client.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) return fail(error.code ?? error.message);
    return succeed(data.url);
  }

  async completeOAuthSignIn(code: string): Promise<Result> {
    const { error } = await this.client.auth.exchangeCodeForSession(code);
    return error ? fail(error.code ?? error.message) : succeed();
  }

  async currentUser(): Promise<CurrentUser | null> {
    // getClaims valida o JWT; getSession não é confiável no servidor.
    const { data, error } = await this.client.auth.getClaims();
    if (error || !data) return null;
    return { id: data.claims.sub, email: data.claims.email ?? null };
  }
}
