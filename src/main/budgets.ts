import "server-only";

import { deleteBudget, listBudgets, saveBudget } from "@/application";
import { createRequestContext } from "./request-context";

export async function makeListBudgets() {
  const { budgets } = await createRequestContext();
  return () => listBudgets(budgets);
}

export async function makeSaveBudget() {
  const { auth, budgets } = await createRequestContext();
  return (input: unknown) => saveBudget({ auth, budgets }, input);
}

export async function makeDeleteBudget() {
  const { budgets } = await createRequestContext();
  return (category: string) => deleteBudget(budgets, category);
}
