import type { Category } from "@/domain";

export type CategoriesByKind = { expense: Category[]; income: Category[] };

const byName = new Intl.Collator("pt-BR", { sensitivity: "base" });

/** Separa por tipo, em ordem alfabética do português (acentos não alteram a ordem). */
export function categoriesByKind(categories: Category[]): CategoriesByKind {
  const sorted = [...categories].sort((a, b) => byName.compare(a.name, b.name));
  return {
    expense: sorted.filter((category) => category.kind === "expense"),
    income: sorted.filter((category) => category.kind === "income"),
  };
}
