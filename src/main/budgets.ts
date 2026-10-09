import "server-only";

import { deleteBudget, listBudgets, saveBudget } from "@/application";
import { createRequestContext } from "./request-context";

export async function makeListBudgets() {
  const { budgets } = await createRequestContext();
  return () => listBudgets(budgets);
}

export async function makeSaveBudget() {
  const { auth, budgets, categories } = await createRequestContext();
  return (input: unknown) => saveBudget({ auth, budgets, categories }, input);
}

export async function makeDeleteBudget() {
  const { budgets } = await createRequestContext();
  return (categoryId: string) => deleteBudget(budgets, categoryId);
}
