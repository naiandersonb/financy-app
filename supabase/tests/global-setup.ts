import { execSync } from "node:child_process";

type LocalSupabaseStatus = { API_URL: string; ANON_KEY: string; SERVICE_ROLE_KEY: string };

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost"]);

/**
 * Lê URL e chaves do Supabase **local** (`supabase status`) e as expõe aos testes.
 * Recusa qualquer URL que não seja local: os testes criam e apagam usuários.
 */
export default function globalSetup() {
  let status: LocalSupabaseStatus;
  try {
    status = JSON.parse(execSync("npx supabase status -o json", { stdio: "pipe" }).toString());
  } catch (error) {
    throw new Error("Supabase local não está rodando. Rode `npm run db:start` antes.", {
      cause: error,
    });
  }

  if (!LOCAL_HOSTS.has(new URL(status.API_URL).hostname)) {
    throw new Error(`Testes de integração só rodam contra o Supabase local, não ${status.API_URL}.`);
  }

  process.env.SUPABASE_TEST_URL = status.API_URL;
  process.env.SUPABASE_TEST_ANON_KEY = status.ANON_KEY;
  process.env.SUPABASE_TEST_SERVICE_ROLE_KEY = status.SERVICE_ROLE_KEY;
}
