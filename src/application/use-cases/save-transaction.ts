import { fail, succeed, type Result } from "@/shared";
import type { TransactionRepository } from "../ports/transaction-repository";
import { transactionInputSchema } from "../schemas/transaction-input-schema";
import { firstIssueMessage } from "../schemas/validation-message";

/** Cria o lançamento, ou atualiza quando `id` vem preenchido. */
export async function saveTransaction(
  transactions: TransactionRepository,
  input: { id?: string } & Record<string, unknown>,
): Promise<Result> {
  const parsed = transactionInputSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssueMessage(parsed.error));

  if (input.id) await transactions.update(input.id, parsed.data);
  else await transactions.create(parsed.data);
  return succeed();
}
