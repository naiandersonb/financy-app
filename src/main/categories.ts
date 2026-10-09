import "server-only";

import { createCategory, deleteCategory, listCategories, updateCategory } from "@/application";
import { createRequestContext } from "./request-context";

export async function makeListCategories() {
  const { categories } = await createRequestContext();
  return () => listCategories(categories);
}

export async function makeCreateCategory() {
  const { categories } = await createRequestContext();
  return (input: unknown) => createCategory(categories, input);
}

export async function makeUpdateCategory() {
  const { categories } = await createRequestContext();
  return (input: unknown) => updateCategory(categories, input);
}

export async function makeDeleteCategory() {
  const { categories } = await createRequestContext();
  return (id: string) => deleteCategory(categories, id);
}
