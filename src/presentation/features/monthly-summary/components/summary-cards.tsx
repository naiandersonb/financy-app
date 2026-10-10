import { ArrowDownCircle, ArrowUpCircle, Scale, type LucideIcon } from "lucide-react";
import type { MonthSummary } from "@/domain";
import { formatCents } from "@/presentation/formatters";
import { cn } from "@/shared";

type SummaryCardsProps = { summary: MonthSummary };

const POSITIVE = "text-emerald-700 dark:text-emerald-400";
const NEGATIVE = "text-destructive";

/** Saldo negativo com o sinal de menos tipográfico, igual à lista: a cor nunca é a única pista. */
function formatBalance(cents: number): string {
  return cents < 0 ? `− ${formatCents(-cents)}` : formatCents(cents);
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <ul aria-label="Resumo do mês" className="grid gap-3 sm:grid-cols-3">
      <SummaryCard
        label="Receitas"
        icon={ArrowUpCircle}
        value={formatCents(summary.incomeCents)}
        tone={POSITIVE}
      />
      <SummaryCard
        label="Despesas"
        icon={ArrowDownCircle}
        value={formatCents(summary.expenseCents)}
        tone={NEGATIVE}
      />
      <SummaryCard
        label="Saldo"
        icon={Scale}
        value={formatBalance(summary.balanceCents)}
        tone={summary.balanceCents < 0 ? NEGATIVE : POSITIVE}
      />
    </ul>
  );
}

function SummaryCard({
  label,
  icon: Icon,
  value,
  tone,
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  tone: string;
}) {
  return (
    <li className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </span>
      <span className={cn("text-2xl font-semibold tabular-nums", tone)}>{value}</span>
    </li>
  );
}
