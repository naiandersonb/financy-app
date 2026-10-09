import type { Category } from "@/domain";
import type { Result } from "@/shared";

export type CategoryInput = Omit<Category, "id">;

/** O tipo de uma categoria não muda depois de criada. */
export type CategoryChanges = Omit<CategoryInput, "kind">;

/** Onde a categoria é usada; qualquer uso impede a remoção. */
export type CategoryUsage = { transactions: number; hasBudget: boolean };

/** O RLS restringe tudo ao usuário da sessão. Falhas de infraestrutura são lançadas como exceção. */
export interface CategoryRepository {
  list(): Promise<Category[]>;
  /** `null` quando não existe ou não pertence ao usuário da sessão. */
  findById(id: string): Promise<Category | null>;
  /** Quantas categorias o usuário da sessão tem. */
  count(): Promise<number>;
  /** Falha prevista: já existe categoria com o mesmo nome (sem diferenciar maiúsculas) no mesmo tipo. */
  create(input: CategoryInput): Promise<Result<void, "duplicate-name">>;
  /** Falha prevista: o novo nome já existe no mesmo tipo. */
  update(id: string, changes: CategoryChanges): Promise<Result<void, "duplicate-name">>;
  usage(id: string): Promise<CategoryUsage>;
  /**
   * Falha prevista: a categoria passou a ser usada entre a checagem de uso e a remoção
   * (o banco recusa pela chave estrangeira).
   */
  delete(id: string): Promise<Result<void, "in-use">>;
}
