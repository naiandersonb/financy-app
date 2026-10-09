import { formatIsoDate, formatIsoMonth, shiftIsoMonth } from "@/shared";

/** Mês no formato YYYY-MM, usado na URL (?month=2026-10). */
export type MonthKey = string;

const MONTH_KEY_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function currentMonthKey(now: Date): MonthKey {
  return formatIsoMonth(now);
}

export function parseMonthKey(value: string | string[] | undefined): MonthKey | null {
  return typeof value === "string" && MONTH_KEY_PATTERN.test(value) ? value : null;
}

export function shiftMonth(month: MonthKey, delta: number): MonthKey {
  return shiftIsoMonth(month, delta);
}

/** Intervalo [início, fim) em datas YYYY-MM-DD, para filtrar por occurred_on. */
export function monthDateRange(month: MonthKey): { start: string; endExclusive: string } {
  return { start: `${month}-01`, endExclusive: `${shiftMonth(month, 1)}-01` };
}

/** Data padrão para um novo lançamento: hoje, se estiver no mês exibido; senão o dia 1º. */
export function defaultDateInMonth(month: MonthKey, now: Date): string {
  const today = formatIsoDate(now);
  return today.startsWith(month) ? today : `${month}-01`;
}
