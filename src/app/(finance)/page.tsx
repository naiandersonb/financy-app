import { currentMonthKey, parseMonthKey } from "@/domain";
import { makeListCategories, makeListMonthTransactions } from "@/main";
import { TransactionList } from "@/presentation/features/transactions";
import { formatMonthLabel } from "@/presentation/formatters";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { month: monthParam } = await searchParams;
  const month = parseMonthKey(monthParam) ?? currentMonthKey(new Date());

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
      <h1 className="text-2xl font-semibold">{formatMonthLabel(month)}</h1>
      <TransactionList transactions={transactions} categories={categories} />
    </main>
  );
}
