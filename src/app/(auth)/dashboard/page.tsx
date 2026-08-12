import { isValid, parse } from "date-fns";
import { BanknoteArrowDown, BanknoteArrowUp } from "lucide-react";
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

  return (
    <div className="grid gap-6 p-6">
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Transações recorrentes ({recurringTransactions.length})
        </h2>
        <ul className="divide-y divide-border rounded-2xl border border-border bg-background">
          {recurringTransactions.map((transaction) => (
            <li
              key={transaction.id}
              className="flex items-center justify-between p-3"
            >
              <span>{transaction.title}</span>
              <span className="text-sm text-muted-foreground">
                {transaction.frequency}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        {/* <h2 className="mb-3 text-lg font-semibold">
          Transações ({transactions.length})
        </h2> */}
        <ul className="divide-y divide-border rounded-2xl border border-border bg-background">
          {transactions.map((transaction) => {
            const isExpense = transaction.type === "expense";
            console.log({ transaction });
            return (
              <li
                key={transaction.id}
                className="flex items-center justify-between p-3"
              >
                <div className="flex items-center gap-4">
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

                  <div>
                    <p className="text-sm font-semibold">{transaction.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.transaction_date)}
                    </p>
                  </div>
                </div>

                <span className="text-sm">
                  {formatCurrency(transaction.amount)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
