import "server-only";

import {
  deleteTransaction,
  listMonthTransactions,
  saveTransaction,
} from "@/application";
import type { MonthKey } from "@/domain";
import { createRequestContext } from "./request-context";

export async function makeListMonthTransactions() {
  const { transactions } = await createRequestContext();
  return (month: MonthKey) => listMonthTransactions(transactions, month);
}

export async function makeSaveTransaction() {
  const { transactions } = await createRequestContext();
  return (input: Parameters<typeof saveTransaction>[1]) => saveTransaction(transactions, input);
}

export async function makeDeleteTransaction() {
  const { transactions } = await createRequestContext();
  return (id: string) => deleteTransaction(transactions, id);
}
