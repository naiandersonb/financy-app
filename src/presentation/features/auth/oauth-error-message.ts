/** Mensagem para o código de erro que o fluxo OAuth coloca na URL (`/login?error=google`). */
export function oauthErrorMessage(code: string | string[] | undefined): string | undefined {
  return code === "google" ? "Não foi possível entrar com o Google. Tente novamente." : undefined;
}
