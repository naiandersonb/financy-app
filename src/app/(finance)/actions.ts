"use server";

import { revalidatePath } from "next/cache";
import {
  makeDeleteBudget,
  makeDeleteTransaction,
  makeSaveBudget,
  makeSaveTransaction,
} from "@/main";
import { fail, type Result } from "@/shared";

export async function saveTransaction(
  _previous: Result | null,
  formData: FormData,
): Promise<Result> {
  return runAndRevalidate("Não foi possível salvar o lançamento.", async () => {
    const save = await makeSaveTransaction();
    return save(Object.fromEntries(formData));
  });
}

export async function deleteTransaction(id: string): Promise<Result> {
  return runAndRevalidate("Não foi possível excluir o lançamento.", async () => {
    const remove = await makeDeleteTransaction();
    await remove(id);
    return { ok: true, value: undefined };
  });
}

export async function saveBudget(
  _previous: Result | null,
  formData: FormData,
): Promise<Result> {
  return runAndRevalidate("Não foi possível salvar o orçamento.", async () => {
    const save = await makeSaveBudget();
    return save(Object.fromEntries(formData));
  });
}

export async function deleteBudget(category: string): Promise<Result> {
  return runAndRevalidate("Não foi possível excluir o orçamento.", async () => {
    const remove = await makeDeleteBudget();
    await remove(category);
    return { ok: true, value: undefined };
  });
}

/**
 * Executa o caso de uso, revalida a tela quando dá certo e troca falhas de infraestrutura
 * por uma mensagem para o usuário. O erro original vai para o log (já sem dados financeiros).
 */
async function runAndRevalidate(
  failureMessage: string,
  run: () => Promise<Result>,
): Promise<Result> {
  try {
    const result = await run();
    if (result.ok) revalidatePath("/");
    return result;
  } catch (error) {
    console.error(failureMessage, error);
    return fail(failureMessage);
  }
}
