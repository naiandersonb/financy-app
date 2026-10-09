import type { Category } from "@/domain";

type CategoryBadgeProps = {
  category: Pick<Category, "name" | "backgroundColor" | "textColor">;
};

/** Selo da categoria: o nome sempre aparece, a cor nunca é a única forma de identificá-la. */
export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span
      className="inline-flex max-w-full items-center truncate rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: category.backgroundColor, color: category.textColor }}
    >
      {category.name}
    </span>
  );
}
