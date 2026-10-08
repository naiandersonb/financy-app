import "server-only";

import { signIn, signOut, signUp } from "@/application";
import { createRequestContext } from "./request-context";

export async function makeSignIn() {
  const { auth } = await createRequestContext();
  return (input: unknown) => signIn(auth, input);
}

export async function makeSignUp() {
  const { auth } = await createRequestContext();
  return (input: unknown) => signUp(auth, input);
}

export async function makeSignOut() {
  const { auth } = await createRequestContext();
  return () => signOut(auth);
}
