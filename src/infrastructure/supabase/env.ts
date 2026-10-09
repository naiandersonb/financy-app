function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não definida. Veja .env.example.`);
  }
  return value;
}

// Acessos literais a process.env são necessários para o Next embutir as variáveis NEXT_PUBLIC_*.
export const supabaseUrl = requireEnv(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

export const supabasePublishableKey = requireEnv(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

/** URL pública do app; base do retorno do login social (nunca derivada do cabeçalho Host). */
export const siteUrl = requireEnv("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL);
