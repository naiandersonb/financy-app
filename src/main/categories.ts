import "server-only";

import { createCategory, listCategories } from "@/application";
import { createRequestContext } from "./request-context";

export async function makeListCategories() {
  const { categories } = await createRequestContext();
  return () => listCategories(categories);
}

export async function makeCreateCategory() {
  const { categories } = await createRequestContext();
  return (input: unknown) => createCategory(categories, input);
}
