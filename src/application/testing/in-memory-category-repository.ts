import type { Category } from "@/domain";
import { fail, succeed, type Result } from "@/shared";
import type { CategoryInput, CategoryRepository } from "../ports/category-repository";

export class InMemoryCategoryRepository implements CategoryRepository {
  readonly items: Category[] = [];
  private nextId = 1;

  async list(): Promise<Category[]> {
    return [...this.items];
  }

  async findById(id: string): Promise<Category | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async count(): Promise<number> {
    return this.items.length;
  }

  /** Imita o índice único do banco: nome sem diferenciar maiúsculas, por tipo. */
  async create(input: CategoryInput): Promise<Result<void, "duplicate-name">> {
    const duplicate = this.items.some(
      (item) => item.kind === input.kind && item.name.toLowerCase() === input.name.toLowerCase(),
    );
    if (duplicate) return fail("duplicate-name");
    this.items.push({ id: `c-${this.nextId++}`, ...input });
    return succeed();
  }
}
