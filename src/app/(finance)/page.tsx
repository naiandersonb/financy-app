import { currentMonthKey, parseMonthKey } from "@/domain";
import { makeListCategories, makeListMonthTransactions } from "@/main";
import { MonthNavigator } from "@/presentation/features/monthly-summary";
import { TransactionDialog, TransactionList } from "@/presentation/features/transactions";
import { deleteTransaction, saveTransaction } from "./actions";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { month: monthParam } = await searchParams;
  const currentMonth = currentMonthKey(new Date());
  const month = parseMonthKey(monthParam) ?? currentMonth;

  const [listMonthTransactions, listCategories] = await Promise.all([
    makeListMonthTransactions(),
    makeListCategories(),
  ]);
  const [transactions, categories] = await Promise.all([
    listMonthTransactions(month),
    listCategories(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthNavigator month={month} currentMonth={currentMonth} />
        <TransactionDialog month={month} categories={categories} onSave={saveTransaction} />
      </div>
      <TransactionList
        transactions={transactions}
        categories={categories}
        month={month}
        onUpdate={saveTransaction}
        onDelete={deleteTransaction}
      />
    </main>
  );
}
