import type { Category } from "@/domain";
import type { CategoryRepository } from "../ports/category-repository";

export function listCategories(categories: CategoryRepository): Promise<Category[]> {
  return categories.list();
}
