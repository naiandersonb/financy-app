"use server";

import { revalidatePath } from "next/cache";
import { parseTransactionForm } from "@/lib/finance/form-parsing";
import type { FormResult } from "@/lib/finance/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function saveTransaction(
  _previous: FormResult | null,
  formData: FormData,
): Promise<FormResult> {
  const parsed = parseTransactionForm(formData);
  if (!parsed.ok) return parsed;

  const { kind, description, amountCents, category, occurredOn } = parsed.value;
  const row = {
    kind,
    description,
    amount_cents: amountCents,
    category,
    occurred_on: occurredOn,
  };

  const supabase = await createSupabaseServerClient();
  const id = formData.get("id");
  const { error } =
    typeof id === "string" && id
      ? await supabase.from("transactions").update(row).eq("id", id)
      : await supabase.from("transactions").insert(row);

  if (error) {
    console.error("Erro ao salvar lançamento", error);
    return { ok: false, error: "Não foi possível salvar o lançamento." };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function deleteTransaction(id: string): Promise<FormResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir lançamento", error);
    return { ok: false, error: "Não foi possível excluir o lançamento." };
  }

  revalidatePath("/");
  return { ok: true };
}
