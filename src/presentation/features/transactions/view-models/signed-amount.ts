import type { Transaction } from "@/domain";
import { formatCents } from "@/presentation/formatters";

export type SignedAmount = { text: string; tone: "income" | "expense" };

/** "+ R$ 10,00" para receita e "− R$ 10,00" para despesa: o sinal acompanha a cor. */
export function signedAmount({ kind, amountCents }: Pick<Transaction, "kind" | "amountCents">): SignedAmount {
  const sign = kind === "income" ? "+" : "−";
  return { text: `${sign} ${formatCents(amountCents)}`, tone: kind };
}
