const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatCents(cents: number): string {
  return brl.format(cents / 100);
}

/** Converte o valor de um <input type="number"> ("1234.5") em centavos. */
export function parseAmountToCents(raw: string): number | null {
  if (!/^\d+(\.\d{1,2})?$/.test(raw.trim())) return null;
  const cents = Math.round(Number(raw) * 100);
  return cents > 0 ? cents : null;
}

/** Formata centavos para o value de um <input type="number">. */
export function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2);
}
