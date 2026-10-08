import { addMonths, format, isValid, parse } from "date-fns";

const ISO_DATE = "yyyy-MM-dd";
const ISO_MONTH = "yyyy-MM";
// Todos os campos vêm do texto; a data de referência só satisfaz a assinatura do parse.
const PARSE_REFERENCE = new Date(2000, 0, 1);

/** "2026-10-08" → Date à meia-noite local. Nunca use `new Date("2026-10-08")`, que é UTC. */
export function parseIsoDate(value: string): Date {
  return parse(value, ISO_DATE, PARSE_REFERENCE);
}

/** "2026-10" → Date do dia 1º à meia-noite local. */
export function parseIsoMonth(value: string): Date {
  return parse(value, ISO_MONTH, PARSE_REFERENCE);
}

export function formatIsoDate(date: Date): string {
  return format(date, ISO_DATE);
}

export function formatIsoMonth(date: Date): string {
  return format(date, ISO_MONTH);
}

/** Verifica se o texto é uma data de calendário real no formato YYYY-MM-DD (rejeita 2026-02-30). */
export function isIsoCalendarDate(value: string): boolean {
  const date = parseIsoDate(value);
  return isValid(date) && formatIsoDate(date) === value;
}

/** Soma (ou subtrai) meses a um mês YYYY-MM, atravessando anos. */
export function shiftIsoMonth(month: string, delta: number): string {
  return formatIsoMonth(addMonths(parseIsoMonth(month), delta));
}
