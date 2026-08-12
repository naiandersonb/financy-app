import {
  PaymentMethod,
  RecurringFrequency,
} from "@/app/core/domain/transactions/transaction.entity";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { Badge } from "@/components/ui/badge";
import { isValid, parse } from "date-fns";
import { BanknoteArrowDown, BanknoteArrowUp, Repeat2 } from "lucide-react";
import Image from "next/image";
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

  const { transactions, recurringTransactions, categories, error } =
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

  const paymentTypeIcons: Record<PaymentMethod, { src: string; alt: string }> =
    {
      pix: { src: "images/icons/pix.svg", alt: "PIX" },
      card: { src: "images/icons/credit-card.svg", alt: "Cartão de crédito" },
      cash: { src: "images/icons/money.svg", alt: "Dinheiro" },
    };

  return (
    <div className="mx-auto max-w-7xl">
      <section className="mb-6 flex items-center justify-end">
        <TransactionFormDialog categories={categories} />
      </section>
      <section>
        <ul className="divide-y divide-border rounded-2xl border border-border bg-background">
          {recurringTransactions.map((transaction) => (
            <li
              key={transaction.id}
              className="flex items-center justify-between gap-3 p-3"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="dark:text-emerald-40 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30">
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

              <div className="grid w-45 shrink-0 grid-cols-2 items-center gap-2 md:w-60">
                {transaction.category ? (
                  <Badge
                    className="line-clamp-1 w-fit max-w-full justify-self-end truncate"
                    variant="secondary"
                    style={{ ...transaction.category?.style }}
                  >
                    {transaction.category.name}
                  </Badge>
                ) : (
                  <div />
                )}
                <div className="flex flex-col items-end gap-1">
                  <span className="text-right text-sm font-medium">
                    {formatCurrency(transaction.amount)}
                  </span>

                  <div className="flex items-center justify-end gap-1.5">
                    <Image
                      src={paymentTypeIcons[transaction.payment_method].src}
                      alt={paymentTypeIcons[transaction.payment_method].alt}
                      width={16}
                      height={16}
                    />
                    <span className="text-xs text-muted-foreground">
                      {paymentTypeIcons[transaction.payment_method].alt}
                    </span>
                  </div>
                </div>
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

                <div className="grid w-45 shrink-0 grid-cols-2 items-center gap-2 md:w-60">
                  {transaction.category ? (
                    <Badge
                      className="line-clamp-1 w-fit max-w-full justify-self-end truncate"
                      variant="secondary"
                      style={{ ...transaction.category?.style }}
                    >
                      {transaction.category.name}
                    </Badge>
                  ) : (
                    <div />
                  )}

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-right text-sm font-medium">
                      {formatCurrency(transaction.amount)}
                    </span>

                    <div className="flex items-center justify-end gap-1.5">
                      <Image
                        src={paymentTypeIcons[transaction.payment_method].src}
                        alt={paymentTypeIcons[transaction.payment_method].alt}
                        width={16}
                        height={16}
                      />
                      <span className="text-xs text-muted-foreground">
                        {paymentTypeIcons[transaction.payment_method].alt}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
