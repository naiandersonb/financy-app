"use server";

import { makeCreateCategory, makeUpdateCategory } from "@/main";
import type { Result } from "@/shared";
import { runAndRevalidate } from "../run-action";

export async function createCategory(
  _previous: Result | null,
  formData: FormData,
): Promise<Result> {
  return runAndRevalidate("Não foi possível criar a categoria.", "/categories", async () => {
    const create = await makeCreateCategory();
    return create(Object.fromEntries(formData));
  });
}

export async function updateCategory(
  _previous: Result | null,
  formData: FormData,
): Promise<Result> {
  // "/" também: lançamentos e orçamentos de todos os meses mostram o nome e as cores da categoria.
  return runAndRevalidate("Não foi possível salvar a categoria.", ["/", "/categories"], async () => {
    const update = await makeUpdateCategory();
    return update(Object.fromEntries(formData));
  });
}
