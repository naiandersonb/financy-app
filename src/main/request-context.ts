import "server-only";

import {
  createSupabaseServerClient,
  SupabaseAuthGateway,
  SupabaseBudgetRepository,
  SupabaseCategoryRepository,
  SupabaseTransactionRepository,
} from "@/infrastructure";

/** Adaptadores ligados ao cliente Supabase da requisição atual (cookies do usuário). */
export async function createRequestContext() {
  const client = await createSupabaseServerClient();
  return {
    auth: new SupabaseAuthGateway(client),
    transactions: new SupabaseTransactionRepository(client),
    budgets: new SupabaseBudgetRepository(client),
    categories: new SupabaseCategoryRepository(client),
  };
}
