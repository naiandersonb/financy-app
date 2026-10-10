import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { shiftMonth, type MonthKey } from "@/domain";
import { buttonVariants } from "@/presentation/components/button";
import { formatMonthLabel } from "@/presentation/formatters";

type MonthNavigatorProps = {
  /** Mês exibido. */
  month: MonthKey;
  /** Mês de hoje, para decidir se mostra o atalho "Mês atual". */
  currentMonth: MonthKey;
};

/** Links reais para `/?month=…`: voltar e avançar do navegador funcionam. */
export function MonthNavigator({ month, currentMonth }: MonthNavigatorProps) {
  const previous = shiftMonth(month, -1);
  const next = shiftMonth(month, 1);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/?month=${previous}`}
        aria-label={`Mês anterior: ${formatMonthLabel(previous)}`}
        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
      >
        <ChevronLeft aria-hidden="true" />
      </Link>
      <h1 className="min-w-44 text-center text-2xl font-semibold">{formatMonthLabel(month)}</h1>
      <Link
        href={`/?month=${next}`}
        aria-label={`Próximo mês: ${formatMonthLabel(next)}`}
        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
      >
        <ChevronRight aria-hidden="true" />
      </Link>
      {month !== currentMonth && (
        <Link href="/" className={buttonVariants({ variant: "link", size: "sm" })}>
          Mês atual
        </Link>
      )}
    </div>
  );
}
