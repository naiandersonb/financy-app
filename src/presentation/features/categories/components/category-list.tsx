import type { Category } from "@/domain";
import { categoriesByKind } from "../view-models/categories-by-kind";
import { CategoryBadge } from "./category-badge";

type CategoryListProps = { categories: Category[] };

export function CategoryList({ categories }: CategoryListProps) {
  const { expense, income } = categoriesByKind(categories);
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <CategorySection title="Despesas" categories={expense} />
      <CategorySection title="Receitas" categories={income} />
    </div>
  );
}

function CategorySection({
  title,
  categories,
}: {
  title: string;
  categories: Category[];
}) {
  const headingId = `categorias-${title.toLowerCase()}`;
  return (
    <section
      aria-labelledby={headingId}
      className="rounded-xl border bg-card p-4"
    >
      <h2 id={headingId} className="mb-3 text-sm font-semibold">
        {title}
      </h2>
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma categoria.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map((category) => (
            <li key={category.id}>
              <CategoryBadge category={category} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
