import { isValid, parse } from "date-fns"
import { getDashboardData } from "./actions"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { month: rawMonth } = await searchParams

  const parsedMonth =
    typeof rawMonth === "string"
      ? parse(rawMonth, "yyyy-MM", new Date())
      : new Date()

  const month = isValid(parsedMonth) ? parsedMonth : new Date()

  const { transactions, recurringTransactions, error } =
    await getDashboardData(month)

  if (error) {
    return <p className="p-4 text-sm text-destructive">{error}</p>
  }

  console.log({ transactions, recurringTransactions })

  return (
    <div className="grid gap-6 p-6">
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Transações ({transactions.length})
        </h2>
        <ul className="divide-y divide-border rounded-2xl border border-border bg-background">
          {transactions.map((transaction) => (
            <li
              key={transaction.id}
              className="flex items-center justify-between p-3"
            >
              <span>{transaction.title}</span>
              <span>
                {transaction.type === "income" ? "+" : "-"} R${" "}
                {transaction.amount}
              </span>
            </li>
          ))}
        </ul>
      </section>

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
    </div>
  )
}
