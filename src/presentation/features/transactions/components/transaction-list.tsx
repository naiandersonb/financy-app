import type { Category, MonthKey, Transaction } from "@/domain";
import { CategoryBadge } from "@/presentation/features/categories";
import { formatDayLabel } from "@/presentation/formatters";
import { cn } from "@/shared";
import { signedAmount } from "../view-models/signed-amount";
import { TransactionDialog, type SaveTransactionAction } from "./transaction-dialog";

type TransactionListProps = {
  /** Já na ordem de exibição (data mais recente primeiro). */
  transactions: Transaction[];
  categories: Category[];
  /** Mês exibido; usado pelo diálogo de edição. */
  month: MonthKey;
  onUpdate: SaveTransactionAction;
};

export function TransactionList({
  transactions,
  categories,
  month,
  onUpdate,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Nenhum lançamento neste mês.
      </p>
    );
  }

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  return (
    <ul aria-label="Lançamentos do mês" className="divide-y rounded-xl border bg-card">
      {transactions.map((transaction) => {
        const category = categoryById.get(transaction.categoryId);
        const amount = signedAmount(transaction);
        return (
          <li
            key={transaction.id}
            className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-4 gap-y-1 px-4 py-3"
          >
            <time
              dateTime={transaction.occurredOn}
              className="w-14 text-xs text-muted-foreground"
            >
              {formatDayLabel(transaction.occurredOn)}
            </time>
            <div className="flex min-w-0 flex-col items-start gap-1">
              <span className="truncate text-sm font-medium">{transaction.description}</span>
              {category ? (
                <CategoryBadge category={category} />
              ) : (
                <span className="text-xs text-muted-foreground">Sem categoria</span>
              )}
            </div>
            <span
              className={cn(
                "text-sm font-semibold tabular-nums whitespace-nowrap",
                amount.tone === "income" ? "text-emerald-700 dark:text-emerald-400" : "text-destructive",
              )}
            >
              {amount.text}
            </span>
            <TransactionDialog
              month={month}
              transaction={transaction}
              categories={categories}
              onSave={onUpdate}
            />
          </li>
        );
      })}
    </ul>
  );
}
