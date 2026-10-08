import { fail, type Result } from "@/shared";
import type { AuthGateway, SignUpOutcome } from "../ports/auth-gateway";
import { signUpCredentialsSchema } from "../schemas/credentials-schema";
import { firstIssueMessage } from "../schemas/validation-message";

export async function signUp(
  auth: AuthGateway,
  input: unknown,
): Promise<Result<SignUpOutcome>> {
  const parsed = signUpCredentialsSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssueMessage(parsed.error));

  const result = await auth.signUp(parsed.data);
  return result.ok
    ? result
    : fail("Não foi possível criar a conta. Verifique os dados e tente novamente.");
}
