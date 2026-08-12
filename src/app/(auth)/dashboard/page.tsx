import { RecurringFrequency } from "@/app/core/domain/transactions/transaction.entity";
import { Badge } from "@/components/ui/badge";
import { isValid, parse } from "date-fns";
import { BanknoteArrowDown, BanknoteArrowUp, Repeat2 } from "lucide-react";
import { getDashboardData } from "./actions";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR");
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { month: rawMonth } = await searchParams;

  const parsedMonth =
    typeof rawMonth === "string"
      ? parse(rawMonth, "yyyy-MM", new Date())
      : new Date();

  const month = isValid(parsedMonth) ? parsedMonth : new Date();

  const { transactions, recurringTransactions, error } =
    await getDashboardData(month);

  if (error) {
    return <p className="p-4 text-sm text-destructive">{error}</p>;
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  const frequencyLabels: Record<RecurringFrequency, string> = {
    daily: "Diário",
    monthly: "Mensal",
    weekly: "Semanal",
    yearly: "Anual",
  };

  return (
    <div className="mx-auto grid max-w-7xl">
      <section>
        <ul className="divide-y divide-border rounded-2xl border border-border bg-background">
          {recurringTransactions.map((transaction) => (
            <li
              key={transaction.id}
              className="flex items-center justify-between gap-3 p-3"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="dark:text-emerald-40 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-purple-600 dark:bg-purple-900/30">
                  <Repeat2 className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {transaction.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {frequencyLabels[transaction.frequency]}
                  </p>
                </div>
              </div>

              <div className="grid w-60 shrink-0 grid-cols-2 items-center gap-2">
                {transaction.category ? (
                  <Badge
                    className="w-fit max-w-full justify-self-end truncate"
                    variant="secondary"
                    style={{ ...transaction.category?.style }}
                  >
                    {transaction.category.name}
                  </Badge>
                ) : (
                  <div />
                )}

                <span className="text-right text-sm font-medium">
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            </li>
          ))}
          {transactions.map((transaction) => {
            const isExpense = transaction.type === "expense";

            return (
              <li
                key={transaction.id}
                className="flex items-center justify-between gap-3 p-3"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isExpense
                        ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    }`}
                  >
                    {isExpense ? (
                      <BanknoteArrowUp className="h-5 w-5" />
                    ) : (
                      <BanknoteArrowDown className="h-5 w-5" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {transaction.title}
                    </p>
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.transaction_date)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid w-60 shrink-0 grid-cols-2 items-center gap-2">
                  {transaction.category ? (
                    <Badge
                      className="w-fit max-w-full justify-self-end truncate"
                      variant="secondary"
                      style={{ ...transaction.category?.style }}
                    >
                      {transaction.category.name}
                    </Badge>
                  ) : (
                    <div />
                  )}

                  <span className="text-right text-sm font-medium">
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
