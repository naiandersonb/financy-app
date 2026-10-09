import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { makeCompleteOAuthSignIn, siteUrl } from "@/main";

/** Retorno do Google (via Supabase): troca o `code` por sessão e redireciona dentro do app. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const completeOAuthSignIn = await makeCompleteOAuthSignIn();
  const result = await completeOAuthSignIn({
    code: params.get("code"),
    next: params.get("next"),
    error: params.get("error"),
  });

  // A base vem de NEXT_PUBLIC_SITE_URL, nunca do cabeçalho Host, que pode ser forjado.
  const destination = result.ok ? result.value : "/login?error=google";
  return NextResponse.redirect(new URL(destination, siteUrl));
}
