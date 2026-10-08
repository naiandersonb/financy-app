/** Mês no formato YYYY-MM, usado na URL (?mes=2026-10). */
export type MonthKey = string;

const MONTH_KEY_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function currentMonthKey(now: Date = new Date()): MonthKey {
  return toMonthKey(now.getFullYear(), now.getMonth() + 1);
}

export function parseMonthKey(value: string | string[] | undefined): MonthKey | null {
  return typeof value === "string" && MONTH_KEY_PATTERN.test(value) ? value : null;
}

export function shiftMonth(month: MonthKey, delta: number): MonthKey {
  const [year, monthNumber] = splitMonthKey(month);
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return toMonthKey(date.getUTCFullYear(), date.getUTCMonth() + 1);
}

/** Intervalo [início, fim) em datas YYYY-MM-DD, para filtrar por occurred_on. */
export function monthDateRange(month: MonthKey): { start: string; endExclusive: string } {
  return { start: `${month}-01`, endExclusive: `${shiftMonth(month, 1)}-01` };
}

export function formatMonthLabel(month: MonthKey): string {
  const [year, monthNumber] = splitMonthKey(month);
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDayLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function splitMonthKey(month: MonthKey): [number, number] {
  const [year, monthNumber] = month.split("-").map(Number);
  return [year, monthNumber];
}

function toMonthKey(year: number, monthNumber: number): MonthKey {
  return `${year}-${String(monthNumber).padStart(2, "0")}`;
}

/** Data padrão para um novo lançamento: hoje, se estiver no mês exibido; senão o dia 1º. */
export function defaultDateInMonth(month: MonthKey, now: Date = new Date()): string {
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  return today.startsWith(month) ? today : `${month}-01`;
}
