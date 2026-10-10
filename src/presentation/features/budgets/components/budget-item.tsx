import type { BudgetState, BudgetStatus, Category } from "@/domain";
import { Progress } from "@/presentation/components/progress";
import { CategoryBadge } from "@/presentation/features/categories";
import { formatCents } from "@/presentation/formatters";
import { cn } from "@/shared";

type BudgetItemProps = {
  status: BudgetStatus;
  category: Category | undefined;
};

const BAR_COLOR: Record<BudgetState, string> = {
  ok: "[&_[data-slot=progress-indicator]]:bg-primary",
  warning: "[&_[data-slot=progress-indicator]]:bg-amber-500",
  over: "[&_[data-slot=progress-indicator]]:bg-destructive",
};

const percent = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 });

export function BudgetItem({ status, category }: BudgetItemProps) {
  const { spentCents, limitCents, remainingCents, usage, state } = status;
  const name = category?.name ?? "Sem categoria";

  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        {category ? (
          <CategoryBadge category={category} />
        ) : (
          <span className="text-muted-foreground">{name}</span>
        )}
        <span className="tabular-nums">
          {formatCents(spentCents)} <span className="text-muted-foreground">de {formatCents(limitCents)}</span>
        </span>
      </div>
      <Progress
        // A barra para em 100%; o quanto passou aparece no texto "Excedeu".
        value={Math.min(usage * 100, 100)}
        aria-label={`Uso do orçamento de ${name}`}
        className={BAR_COLOR[state]}
      />
      <p
        className={cn(
          "flex justify-between text-xs",
          state === "over" ? "font-medium text-destructive" : "text-muted-foreground",
          state === "warning" && "text-amber-700 dark:text-amber-400",
        )}
      >
        <span>
          {state === "over"
            ? `Excedeu ${formatCents(-remainingCents)}`
            : `Restam ${formatCents(remainingCents)}`}
        </span>
        <span className="tabular-nums">{percent.format(usage)}</span>
      </p>
    </li>
  );
}
