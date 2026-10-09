import "server-only";

import { listCategories } from "@/application";
import { createRequestContext } from "./request-context";

export async function makeListCategories() {
  const { categories } = await createRequestContext();
  return () => listCategories(categories);
}
