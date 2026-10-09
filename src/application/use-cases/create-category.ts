import { MAX_CATEGORIES_PER_USER } from "@/domain";
import { fail, succeed, type Result } from "@/shared";
import type { CategoryRepository } from "../ports/category-repository";
import { categoryInputSchema } from "../schemas/category-input-schema";
import { firstIssueMessage } from "../schemas/validation-message";

export async function createCategory(
  categories: CategoryRepository,
  input: unknown,
): Promise<Result> {
  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssueMessage(parsed.error));

  if ((await categories.count()) >= MAX_CATEGORIES_PER_USER) {
    return fail(`Limite de ${MAX_CATEGORIES_PER_USER} categorias atingido.`);
  }

  const created = await categories.create(parsed.data);
  return created.ok ? succeed() : fail("Já existe uma categoria com esse nome.");
}
