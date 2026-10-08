const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatCents(cents: number): string {
  return brl.format(cents / 100);
}

/** Formata centavos para o value de um <input type="number">. */
export function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2);
}
