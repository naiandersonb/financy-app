import type { AuthGateway } from "../ports/auth-gateway";

export function signOut(auth: AuthGateway): Promise<void> {
  return auth.signOut();
}
