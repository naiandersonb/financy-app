import { execFileSync } from "node:child_process";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DB_CONTAINER = "supabase_db_finance-app";
const CLIENT_OPTIONS = { auth: { persistSession: false, autoRefreshToken: false } };

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} não definida; o globalSetup deveria tê-la preenchido.`);
  return value;
}

/** Cliente como o app usa: chave pública, sem sessão (visitante). */
export function anonymousClient(): SupabaseClient {
  return createClient(env("SUPABASE_TEST_URL"), env("SUPABASE_TEST_ANON_KEY"), CLIENT_OPTIONS);
}

/** Cliente administrativo do Supabase local; só para preparar e limpar os testes. */
function adminClient(): SupabaseClient {
  return createClient(env("SUPABASE_TEST_URL"), env("SUPABASE_TEST_SERVICE_ROLE_KEY"), CLIENT_OPTIONS);
}

export type TestUser = { id: string; client: SupabaseClient };

/** Cria um usuário confirmado e devolve um cliente já logado como ele. */
export async function createTestUser(label: string): Promise<TestUser> {
  const email = `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@teste.local`;
  const password = "senha-de-teste-123";
  const { data, error } = await adminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`Falha ao criar usuário de teste ${label}`, { cause: error });

  const client = anonymousClient();
  const signIn = await client.auth.signInWithPassword({ email, password });
  if (signIn.error) throw new Error(`Falha ao logar ${label}`, { cause: signIn.error });

  return { id: data.user.id, client };
}

export async function deleteTestUser(user: TestUser | undefined): Promise<void> {
  if (!user) return;
  const { error } = await adminClient().auth.admin.deleteUser(user.id);
  if (error) throw new Error("Falha ao apagar usuário de teste", { cause: error });
}

/** Executa SQL como superusuário no container do banco local (para checagens de catálogo). */
export function queryDatabase(sql: string): string {
  return execFileSync("docker", ["exec", DB_CONTAINER, "psql", "-U", "postgres", "-tAc", sql])
    .toString()
    .trim();
}
