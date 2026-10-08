"use server";

import { revalidatePath } from "next/cache";
import { parseBudgetForm } from "@/lib/finance/form-parsing";
import type { Result } from "@/shared";
import { createSupabaseServerClient, getCurrentUserId } from "@/lib/supabase/server";

export async function saveBudget(
  _previous: Result | null,
  formData: FormData,
): Promise<Result> {
  const parsed = parseBudgetForm(formData);
  if (!parsed.ok) return parsed;

  // O upsert precisa do user_id explícito para resolver o conflito da chave primária.
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sua sessão expirou. Entre novamente." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("budgets").upsert({
    user_id: userId,
    category: parsed.value.category,
    limit_cents: parsed.value.limitCents,
  });

  if (error) {
    console.error("Erro ao salvar orçamento", error);
    return { ok: false, error: "Não foi possível salvar o orçamento." };
  }

  revalidatePath("/");
  return { ok: true, value: undefined };
}

export async function deleteBudget(category: string): Promise<Result> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("budgets").delete().eq("category", category);

  if (error) {
    console.error("Erro ao excluir orçamento", error);
    return { ok: false, error: "Não foi possível excluir o orçamento." };
  }

  revalidatePath("/");
  return { ok: true, value: undefined };
}
