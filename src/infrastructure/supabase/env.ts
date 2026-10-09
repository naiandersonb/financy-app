function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não definida. Veja .env.example.`);
  }
  return value;
}

/**
 * Barra a chave secreta numa variável pública: ela ignora o RLS e, sendo NEXT_PUBLIC_, é copiada
 * para o build e pode chegar ao navegador. A mensagem nunca inclui o valor da chave.
 */
function rejectSecretKey(name: string, key: string): string {
  if (key.startsWith("sb_secret_") || legacyJwtRole(key) === "service_role") {
    throw new Error(
      `${name} contém uma chave secreta. Use a Publishable key (sb_publishable_...) do painel ` +
        "do Supabase; a chave secreta nunca deve ficar numa variável NEXT_PUBLIC_.",
    );
  }
  return key;
}

/** Papel (`role`) do payload de uma chave JWT legada; `undefined` se não for um JWT legível. */
function legacyJwtRole(key: string): unknown {
  const payload = key.split(".")[1];
  if (!payload) return undefined;
  try {
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))).role;
  } catch {
    // Não é um JWT: as chaves novas (sb_publishable_...) não têm payload.
    return undefined;
  }
}

// Acessos literais a process.env são necessários para o Next embutir as variáveis NEXT_PUBLIC_*.
export const supabaseUrl = requireEnv(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

export const supabasePublishableKey = rejectSecretKey(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  requireEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
);

/** URL pública do app; base do retorno do login social (nunca derivada do cabeçalho Host). */
export const siteUrl = requireEnv("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL);
