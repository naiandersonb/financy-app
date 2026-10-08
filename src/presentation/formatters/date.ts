import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { MonthKey } from "@/domain";
import { parseIsoDate, parseIsoMonth } from "@/shared";

export function formatMonthLabel(month: MonthKey): string {
  const label = format(parseIsoMonth(month), "MMMM 'de' yyyy", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDayLabel(isoDate: string): string {
  return format(parseIsoDate(isoDate), "dd 'de' MMM", { locale: ptBR });
}
