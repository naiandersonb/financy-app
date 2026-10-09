import { fail, type Result } from "@/shared";
import type { AuthGateway } from "../ports/auth-gateway";

export const OAUTH_CALLBACK_PATH = "/auth/callback";

/** Devolve a URL do Google para onde o usuário deve ser redirecionado. */
export async function startGoogleSignIn(
  auth: AuthGateway,
  siteUrl: string,
): Promise<Result<string>> {
  const result = await auth.startOAuthSignIn("google", `${siteUrl}${OAUTH_CALLBACK_PATH}`);
  return result.ok ? result : fail("oauth_start_failed");
}
