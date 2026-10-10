import { compareCategoryNames, type Category } from "@/domain";

export type CategoriesByKind = { expense: Category[]; income: Category[] };

/** Separa por tipo, em ordem alfabética do português (acentos não alteram a ordem). */
export function categoriesByKind(categories: Category[]): CategoriesByKind {
  const sorted = [...categories].sort((a, b) => compareCategoryNames(a.name, b.name));
  return {
    expense: sorted.filter((category) => category.kind === "expense"),
    income: sorted.filter((category) => category.kind === "income"),
  };
}
