/**
 * Hosts de onde o app aceita exibir a foto do usuário. É também a lista liberada no `next/image`
 * (`next.config.ts` importa este arquivo), para as duas nunca divergirem.
 */
export const AVATAR_HOSTS = ["lh3.googleusercontent.com"] as const;

/** A URL vem de `user_metadata`, que o próprio usuário pode alterar: só HTTPS em host permitido. */
export function isAllowedAvatarUrl(url: string | null): url is string {
  if (!url) return false;
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && (AVATAR_HOSTS as readonly string[]).includes(hostname);
  } catch {
    // Texto que não é URL: tratado como sem foto.
    return false;
  }
}
