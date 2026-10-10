import { contrastRatio } from "@/shared";

/** WCAG AA para texto normal. */
export const MIN_CATEGORY_CONTRAST = 4.5;

export const MAX_CATEGORIES_PER_USER = 50;

/** O nome da categoria precisa ser legível sobre a própria cor de fundo. */
export function hasReadableContrast(backgroundColor: string, textColor: string): boolean {
  const ratio = contrastRatio(backgroundColor, textColor);
  return ratio !== null && ratio >= MIN_CATEGORY_CONTRAST;
}

const byName = new Intl.Collator("pt-BR", { sensitivity: "base" });

/** Ordem alfabética do português: acentos e maiúsculas não alteram a posição. */
export function compareCategoryNames(first: string, second: string): number {
  return byName.compare(first, second);
}
