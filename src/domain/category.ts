import { contrastRatio } from "@/shared";

/** WCAG AA para texto normal. */
export const MIN_CATEGORY_CONTRAST = 4.5;

export const MAX_CATEGORIES_PER_USER = 50;

/** O nome da categoria precisa ser legível sobre a própria cor de fundo. */
export function hasReadableContrast(backgroundColor: string, textColor: string): boolean {
  const ratio = contrastRatio(backgroundColor, textColor);
  return ratio !== null && ratio >= MIN_CATEGORY_CONTRAST;
}
