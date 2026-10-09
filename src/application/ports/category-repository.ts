import type { Category } from "@/domain";
import type { Result } from "@/shared";

export type CategoryInput = Omit<Category, "id">;

/** O RLS restringe tudo ao usuário da sessão. Falhas de infraestrutura são lançadas como exceção. */
export interface CategoryRepository {
  list(): Promise<Category[]>;
  /** Quantas categorias o usuário da sessão tem. */
  count(): Promise<number>;
  /** Falha prevista: já existe categoria com o mesmo nome (sem diferenciar maiúsculas) no mesmo tipo. */
  create(input: CategoryInput): Promise<Result<void, "duplicate-name">>;
}
