import type { Category } from "@/domain";
import type { CategoryRepository } from "../ports/category-repository";

export class InMemoryCategoryRepository implements CategoryRepository {
  readonly items: Category[] = [];

  async list(): Promise<Category[]> {
    return [...this.items];
  }
}
