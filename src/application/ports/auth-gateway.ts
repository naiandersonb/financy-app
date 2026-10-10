import type { Result } from "@/shared";

export type Credentials = { email: string; password: string };

/** Depois do cadastro, o usuário já entra ou precisa confirmar o e-mail antes. */
export type SignUpOutcome = "signed-in" | "confirmation-required";

export type CurrentUser = {
  id: string;
  email: string | null;
  /** Nome vindo do provedor social (ex.: Google); `null` no cadastro com e-mail e senha. */
  name: string | null;
  /** Foto do provedor social (ex.: Google). Vem de dado editável pelo usuário: não é confiável. */
  avatarUrl: string | null;
};

export type OAuthProvider = "google";

export interface AuthGateway {
  signIn(credentials: Credentials): Promise<Result>;
  signUp(credentials: Credentials): Promise<Result<SignUpOutcome>>;
  signOut(): Promise<void>;
  /** Inicia o OAuth e devolve a URL do provedor para onde o usuário deve ir. */
  startOAuthSignIn(provider: OAuthProvider, redirectTo: string): Promise<Result<string>>;
  /** Troca o `code` recebido no retorno do provedor por uma sessão. */
  completeOAuthSignIn(code: string): Promise<Result>;
  /** Usuário da sessão atual, com a identidade já validada; `null` sem sessão. */
  currentUser(): Promise<CurrentUser | null>;
}
