import type { Result } from "@/shared";

export type Credentials = { email: string; password: string };

/** Depois do cadastro, o usuário já entra ou precisa confirmar o e-mail antes. */
export type SignUpOutcome = "signed-in" | "confirmation-required";

export type CurrentUser = { id: string; email: string | null };

export interface AuthGateway {
  signIn(credentials: Credentials): Promise<Result>;
  signUp(credentials: Credentials): Promise<Result<SignUpOutcome>>;
  signOut(): Promise<void>;
  /** Usuário da sessão atual, com a identidade já validada; `null` sem sessão. */
  currentUser(): Promise<CurrentUser | null>;
}
