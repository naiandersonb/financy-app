import type { Category } from "@/domain";
import { fail, succeed, type Result } from "@/shared";
import type {
  CategoryChanges,
  CategoryInput,
  CategoryRepository,
} from "../ports/category-repository";

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

  async create(input: CategoryInput): Promise<Result<void, "duplicate-name">> {
    if (this.hasName(input.kind, input.name)) return fail("duplicate-name");
    this.items.push({ id: `c-${this.nextId++}`, ...input });
    return succeed();
  }

  async update(id: string, changes: CategoryChanges): Promise<Result<void, "duplicate-name">> {
    const index = this.items.findIndex((item) => item.id === id);
    const current = this.items[index];
    if (this.hasName(current.kind, changes.name, id)) return fail("duplicate-name");
    this.items[index] = { ...current, ...changes };
    return succeed();
  }

  /** Imita o índice único do banco: nome sem diferenciar maiúsculas, por tipo. */
  private hasName(kind: Category["kind"], name: string, ignoreId?: string): boolean {
    return this.items.some(
      (item) =>
        item.id !== ignoreId &&
        item.kind === kind &&
        item.name.toLowerCase() === name.toLowerCase(),
    );
  }
}
