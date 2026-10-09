import "server-only";

import {
  completeOAuthSignIn,
  getCurrentUser,
  signIn,
  signOut,
  signUp,
  startGoogleSignIn,
  type OAuthCallbackParams,
} from "@/application";
import { siteUrl } from "@/infrastructure";
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

export async function makeGetCurrentUser() {
  const { auth } = await createRequestContext();
  return () => getCurrentUser(auth);
}

export async function makeStartGoogleSignIn() {
  const { auth } = await createRequestContext();
  return () => startGoogleSignIn(auth, siteUrl);
}

export async function makeCompleteOAuthSignIn() {
  const { auth } = await createRequestContext();
  return (params: OAuthCallbackParams) => completeOAuthSignIn(auth, params);
}
