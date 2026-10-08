const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Verifica se o texto é uma data de calendário real no formato YYYY-MM-DD (rejeita 2026-02-30). */
export function isIsoCalendarDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
