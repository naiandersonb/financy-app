import { fail, succeed, type Result } from "@/shared";
import type { AuthGateway } from "../ports/auth-gateway";
import type { BudgetRepository } from "../ports/budget-repository";
import type { CategoryRepository } from "../ports/category-repository";
import { budgetInputSchema } from "../schemas/budget-input-schema";
import { firstIssueMessage } from "../schemas/validation-message";

export async function saveBudget(
  deps: { budgets: BudgetRepository; categories: CategoryRepository; auth: AuthGateway },
  input: unknown,
): Promise<Result> {
  const parsed = budgetInputSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssueMessage(parsed.error));

  // A chave estrangeira do banco também garante isso; aqui a falha vira mensagem para o usuário.
  const category = await deps.categories.findById(parsed.data.categoryId);
  if (category?.kind !== "expense") return fail("Escolha uma categoria de despesa.");

  const user = await deps.auth.currentUser();
  if (!user) return fail("Sua sessão expirou. Entre novamente.");

  await deps.budgets.upsert(user.id, parsed.data);
  return succeed();
}
