import { fail, succeed, type Result } from "@/shared";
import type { CategoryRepository } from "../ports/category-repository";
import type { TransactionRepository } from "../ports/transaction-repository";
import { transactionInputSchema } from "../schemas/transaction-input-schema";
import { firstIssueMessage } from "../schemas/validation-message";

/** Cria o lançamento, ou atualiza quando `id` vem preenchido. */
export async function saveTransaction(
  deps: { transactions: TransactionRepository; categories: CategoryRepository },
  input: { id?: string } & Record<string, unknown>,
): Promise<Result> {
  const parsed = transactionInputSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssueMessage(parsed.error));

  // A chave estrangeira do banco também garante isso; aqui a falha vira mensagem para o usuário.
  const category = await deps.categories.findById(parsed.data.categoryId);
  if (category?.kind !== parsed.data.kind) return fail("Escolha uma categoria válida.");

  if (input.id) await deps.transactions.update(input.id, parsed.data);
  else await deps.transactions.create(parsed.data);
  return succeed();
}
