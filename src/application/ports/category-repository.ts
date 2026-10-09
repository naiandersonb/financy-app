import type { Category } from "@/domain";

/** O RLS restringe tudo ao usuário da sessão. Falhas de infraestrutura são lançadas como exceção. */
export interface CategoryRepository {
  list(): Promise<Category[]>;
}
