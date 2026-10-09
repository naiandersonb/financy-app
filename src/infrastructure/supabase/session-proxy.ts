import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublishableKey, supabaseUrl } from "./env";

const PUBLIC_PATHS = ["/login", "/signup", "/auth/callback"];

export async function refreshSessionAndGuard(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  // getClaims valida o JWT e renova o token expirado; não remova esta chamada.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);
  const isPublicPath = isPublic(request.nextUrl.pathname);

  if (!isAuthenticated && !isPublicPath) {
    return redirectPreservingCookies(request, response, "/login");
  }
  if (isAuthenticated && isPublicPath) {
    return redirectPreservingCookies(request, response, "/");
  }
  return response;
}

/** Rota pública exata ou subcaminho dela (`/login/x`), mas não prefixos como `/loginx`. */
function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function redirectPreservingCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
