import { currentMonthKey, parseMonthKey } from "@/domain";
import { makeGetMonthOverview } from "@/main";
import { BudgetSection } from "@/presentation/features/budgets";
import { CategoryBreakdown } from "@/presentation/features/category-spending";
import { MonthNavigator, SummaryCards } from "@/presentation/features/monthly-summary";
import { TransactionDialog, TransactionList } from "@/presentation/features/transactions";
import { deleteTransaction, saveBudget, saveTransaction } from "./actions";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { month: monthParam } = await searchParams;
  const currentMonth = currentMonthKey(new Date());
  const month = parseMonthKey(monthParam) ?? currentMonth;

  const getMonthOverview = await makeGetMonthOverview();
  const { transactions, summary, categories, spending, budgets } = await getMonthOverview(month);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthNavigator month={month} currentMonth={currentMonth} />
        <TransactionDialog month={month} categories={categories} onSave={saveTransaction} />
      </div>
      <SummaryCards summary={summary} />
      <CategoryBreakdown spending={spending} categories={categories} />
      <BudgetSection budgets={budgets} categories={categories} onSave={saveBudget} />
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
