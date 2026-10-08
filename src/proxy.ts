import type { NextRequest } from "next/server";
import { refreshSessionAndGuard } from "@/infrastructure";

export function proxy(request: NextRequest) {
  return refreshSessionAndGuard(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
