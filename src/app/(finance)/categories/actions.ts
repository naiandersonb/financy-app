"use server";

import { makeCreateCategory } from "@/main";
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
