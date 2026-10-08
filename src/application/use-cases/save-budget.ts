import { fail, succeed, type Result } from "@/shared";
import type { AuthGateway } from "../ports/auth-gateway";
import type { BudgetRepository } from "../ports/budget-repository";
import { budgetInputSchema } from "../schemas/budget-input-schema";
import { firstIssueMessage } from "../schemas/validation-message";

export async function saveBudget(
  deps: { budgets: BudgetRepository; auth: AuthGateway },
  input: unknown,
): Promise<Result> {
  const parsed = budgetInputSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssueMessage(parsed.error));

  const userId = await deps.auth.currentUserId();
  if (!userId) return fail("Sua sessão expirou. Entre novamente.");

  await deps.budgets.upsert(userId, parsed.data);
  return succeed();
}
