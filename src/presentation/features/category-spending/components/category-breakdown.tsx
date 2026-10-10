import type { Category, CategorySpending } from "@/domain";
import { CategoryBadge } from "@/presentation/features/categories";
import { formatCents } from "@/presentation/formatters";

type CategoryBreakdownProps = {
  /** Já ordenado (maior gasto primeiro). */
  spending: CategorySpending[];
  categories: Category[];
};

const percent = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 });

export function CategoryBreakdown({ spending, categories }: CategoryBreakdownProps) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  return (
    <section aria-labelledby="gastos-por-categoria" className="rounded-xl border bg-card p-4">
      <h2 id="gastos-por-categoria" className="mb-4 text-sm font-semibold">
        Gastos por categoria
      </h2>
      {spending.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma despesa neste mês.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {spending.map(({ categoryId, spentCents, shareOfExpenses }) => {
            const category = categoryById.get(categoryId);
            return (
              <li key={categoryId} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  {category ? (
                    <CategoryBadge category={category} />
                  ) : (
                    <span className="text-muted-foreground">Sem categoria</span>
                  )}
                  <span className="flex items-baseline gap-2 tabular-nums">
                    <span className="font-medium">{formatCents(spentCents)}</span>
                    <span className="w-10 text-right text-muted-foreground">
                      {percent.format(shareOfExpenses)}
                    </span>
                  </span>
                </div>
                {/* Valor e percentual já estão em texto; a barra é só um reforço visual. */}
                <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${shareOfExpenses * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
