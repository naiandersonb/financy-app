import { fail, succeed, type Result } from "@/shared";
import type { AuthGateway } from "../ports/auth-gateway";
import { redirectPathSchema } from "../schemas/redirect-path-schema";

export type OAuthCallbackParams = {
  code: string | null;
  next: string | null;
  /** Preenchido pelo provedor quando o usuário cancela ou algo falha antes do retorno. */
  error: string | null;
};

/** Cria a sessão a partir do retorno do provedor e devolve o caminho interno de destino. */
export async function completeOAuthSignIn(
  auth: AuthGateway,
  { code, next, error }: OAuthCallbackParams,
): Promise<Result<string>> {
  if (error || !code) return fail("oauth_cancelled_or_missing_code");

  const result = await auth.completeOAuthSignIn(code);
  if (!result.ok) return fail("oauth_exchange_failed");

  return succeed(redirectPathSchema.parse(next ?? undefined));
}
