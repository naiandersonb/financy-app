import { isValidCategory } from "./categories";
import { parseAmountToCents } from "./money";
import type { Budget, Transaction, TransactionKind } from "./types";

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

export type TransactionInput = Omit<Transaction, "id">;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseTransactionForm(formData: FormData): Parsed<TransactionInput> {
  const kind = field(formData, "kind");
  if (kind !== "income" && kind !== "expense") {
    return { ok: false, error: "Escolha se é receita ou despesa." };
  }

  const description = field(formData, "description").trim();
  if (description.length === 0 || description.length > 120) {
    return { ok: false, error: "Informe uma descrição com até 120 caracteres." };
  }

  const amountCents = parseAmountToCents(field(formData, "amount"));
  if (amountCents === null) {
    return { ok: false, error: "Informe um valor maior que zero." };
  }

  const category = field(formData, "category");
  if (!isValidCategory(kind as TransactionKind, category)) {
    return { ok: false, error: "Escolha uma categoria válida." };
  }

  const occurredOn = field(formData, "occurredOn");
  if (!ISO_DATE_PATTERN.test(occurredOn) || Number.isNaN(Date.parse(occurredOn))) {
    return { ok: false, error: "Informe uma data válida." };
  }

  return { ok: true, value: { kind, description, amountCents, category, occurredOn } };
}

export function parseBudgetForm(formData: FormData): Parsed<Budget> {
  const category = field(formData, "category");
  if (!isValidCategory("expense", category)) {
    return { ok: false, error: "Escolha uma categoria de despesa." };
  }

  const limitCents = parseAmountToCents(field(formData, "limit"));
  if (limitCents === null) {
    return { ok: false, error: "Informe um limite maior que zero." };
  }

  return { ok: true, value: { category, limitCents } };
}

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}
