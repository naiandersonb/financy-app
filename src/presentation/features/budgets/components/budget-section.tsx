import type { BudgetStatus, Category } from "@/domain";
import { categoriesWithoutBudget } from "../view-models/categories-without-budget";
import { BudgetDialog, type SaveBudgetAction } from "./budget-dialog";
import { BudgetItem } from "./budget-item";

type BudgetSectionProps = {
  /** Já ordenado: estourados primeiro, depois do maior para o menor uso. */
  budgets: BudgetStatus[];
  categories: Category[];
  onSave: SaveBudgetAction;
};

export function BudgetSection({ budgets, categories, onSave }: BudgetSectionProps) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const overCount = budgets.filter((budget) => budget.state === "over").length;
  const available = categoriesWithoutBudget(categories, budgets);

  return (
    <section aria-labelledby="orcamentos" className="rounded-xl border bg-card p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="orcamentos" className="text-sm font-semibold">
          Orçamentos
        </h2>
        {available.length > 0 && <BudgetDialog categories={available} onSave={onSave} />}
      </div>
      {overCount > 0 && (
        <p role="status" className="mb-3 text-sm font-medium text-destructive">
          {overCount === 1
            ? "1 categoria acima do limite"
            : `${overCount} categorias acima do limite`}
        </p>
      )}
      {budgets.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum limite definido. Defina limites para acompanhar seus gastos.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {budgets.map((status) => (
            <BudgetItem
              key={status.categoryId}
              status={status}
              category={categoryById.get(status.categoryId)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
