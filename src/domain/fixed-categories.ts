import type { TransactionKind } from "./transaction.types";

export const EXPENSE_CATEGORIES = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Contas e serviços",
  "Outros",
] as const;

export const INCOME_CATEGORIES = [
  "Salário",
  "Freelance",
  "Investimentos",
  "Outros",
] as const;

export function categoriesFor(kind: TransactionKind): readonly string[] {
  return kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function isValidCategory(kind: TransactionKind, category: string): boolean {
  return categoriesFor(kind).includes(category);
}
