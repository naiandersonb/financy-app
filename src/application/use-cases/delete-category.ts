import { fail, succeed, type Result } from "@/shared";
import type { CategoryRepository } from "../ports/category-repository";
import { categoryIdSchema } from "../schemas/category-input-schema";

const NOT_FOUND = "Categoria não encontrada.";
const KIND_LABEL = { expense: "despesa", income: "receita" } as const;

/** Remove a categoria, desde que não esteja em uso nem seja a última do seu tipo. */
export async function deleteCategory(
  categories: CategoryRepository,
  id: string,
): Promise<Result> {
  if (!categoryIdSchema.safeParse(id).success) return fail(NOT_FOUND);

  // Com RLS, a categoria de outro usuário também aparece como inexistente.
  const category = await categories.findById(id);
  if (!category) return fail(NOT_FOUND);

  const sameKind = (await categories.list()).filter((item) => item.kind === category.kind);
  if (sameKind.length <= 1) {
    return fail(`Mantenha pelo menos uma categoria de ${KIND_LABEL[category.kind]}.`);
  }

  const usage = await categories.usage(id);
  if (usage.transactions > 0) {
    const count =
      usage.transactions === 1 ? "1 lançamento" : `${usage.transactions} lançamentos`;
    return fail(
      `Esta categoria tem ${count} e não pode ser removida. ` +
        "Mova os lançamentos para outra categoria antes.",
    );
  }
  if (usage.hasBudget) {
    return fail(
      "Esta categoria tem um orçamento definido e não pode ser removida. Remova o orçamento antes.",
    );
  }

  const deleted = await categories.delete(id);
  return deleted.ok
    ? succeed()
    : fail("Esta categoria passou a ser usada e não pode ser removida.");
}
