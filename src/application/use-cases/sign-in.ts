import { fail, succeed, type Result } from "@/shared";
import type { AuthGateway } from "../ports/auth-gateway";
import { signInCredentialsSchema } from "../schemas/credentials-schema";

// Mensagem única para não revelar se o e-mail tem conta.
const INVALID_CREDENTIALS = "E-mail ou senha inválidos.";

export async function signIn(auth: AuthGateway, input: unknown): Promise<Result> {
  const parsed = signInCredentialsSchema.safeParse(input);
  if (!parsed.success) return fail(INVALID_CREDENTIALS);

  const result = await auth.signIn(parsed.data);
  return result.ok ? succeed() : fail(INVALID_CREDENTIALS);
}
