"use server";

import {
  makeDeleteBudget,
  makeDeleteTransaction,
  makeSaveBudget,
  makeSaveTransaction,
} from "@/main";
import type { Result } from "@/shared";
import { runAndRevalidate } from "./run-action";

export async function saveTransaction(
  _previous: Result | null,
  formData: FormData,
): Promise<Result> {
  return runAndRevalidate("Não foi possível salvar o lançamento.", "/", async () => {
    const save = await makeSaveTransaction();
    return save(Object.fromEntries(formData));
  });
}

export async function deleteTransaction(id: string): Promise<Result> {
  return runAndRevalidate("Não foi possível excluir o lançamento.", "/", async () => {
    const remove = await makeDeleteTransaction();
    await remove(id);
    return { ok: true, value: undefined };
  });
}

export async function saveBudget(
  _previous: Result | null,
  formData: FormData,
): Promise<Result> {
  return runAndRevalidate("Não foi possível salvar o orçamento.", "/", async () => {
    const save = await makeSaveBudget();
    return save(Object.fromEntries(formData));
  });
}

export async function deleteBudget(category: string): Promise<Result> {
  return runAndRevalidate("Não foi possível excluir o orçamento.", "/", async () => {
    const remove = await makeDeleteBudget();
    await remove(category);
    return { ok: true, value: undefined };
  });
}
