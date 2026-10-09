import type { AuthGateway, CurrentUser } from "../ports/auth-gateway";

export function getCurrentUser(auth: AuthGateway): Promise<CurrentUser | null> {
  return auth.currentUser();
}
