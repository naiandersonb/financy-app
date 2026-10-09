import type { Category } from "@/domain";
import { categoriesByKind } from "../view-models/categories-by-kind";
import { CategoryBadge } from "./category-badge";
import { CategoryDialog, type SaveCategoryAction } from "./category-dialog";
import { DeleteCategoryButton, type DeleteCategoryAction } from "./delete-category-button";

type CategoryListProps = {
  categories: Category[];
  onUpdate: SaveCategoryAction;
  onDelete: DeleteCategoryAction;
};

export function CategoryList({ categories, onUpdate, onDelete }: CategoryListProps) {
  const { expense, income } = categoriesByKind(categories);
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <CategorySection
        title="Despesas"
        categories={expense}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
      <CategorySection
        title="Receitas"
        categories={income}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
}

function CategorySection({
  title,
  categories,
  onUpdate,
  onDelete,
}: CategoryListProps & { title: string }) {
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
            <li key={category.id} className="flex items-center justify-between gap-2">
              <CategoryBadge category={category} />
              <div className="flex shrink-0 items-center">
                <CategoryDialog category={category} onSave={onUpdate} />
                <DeleteCategoryButton category={category} onDelete={onDelete} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
