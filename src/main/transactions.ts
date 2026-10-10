import "server-only";

import {
  deleteTransaction,
  getMonthOverview,
  saveTransaction,
} from "@/application";
import type { MonthKey } from "@/domain";
import { createRequestContext } from "./request-context";

export async function makeGetMonthOverview() {
  const { transactions } = await createRequestContext();
  return (month: MonthKey) => getMonthOverview(transactions, month);
}

export async function makeSaveTransaction() {
  const { transactions, categories } = await createRequestContext();
  return (input: Parameters<typeof saveTransaction>[1]) =>
    saveTransaction({ transactions, categories }, input);
}

export async function makeDeleteTransaction() {
  const { transactions } = await createRequestContext();
  return (id: string) => deleteTransaction(transactions, id);
}
