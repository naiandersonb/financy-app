import { fail, succeed, type Result } from "@/shared";
import type { CategoryRepository } from "../ports/category-repository";
import { categoryUpdateSchema } from "../schemas/category-input-schema";
import { firstIssueMessage } from "../schemas/validation-message";

export async function updateCategory(
  categories: CategoryRepository,
  input: unknown,
): Promise<Result> {
  const parsed = categoryUpdateSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssueMessage(parsed.error));

  const { id, ...changes } = parsed.data;
  // Com RLS, a categoria de outro usuário também aparece como inexistente.
  if (!(await categories.findById(id))) return fail("Categoria não encontrada.");

  const updated = await categories.update(id, changes);
  return updated.ok ? succeed() : fail("Já existe uma categoria com esse nome.");
}
