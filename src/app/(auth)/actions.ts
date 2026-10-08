"use server";

import { redirect } from "next/navigation";
import { makeSignIn, makeSignOut, makeSignUp } from "@/main";
import type { AuthFormState } from "@/presentation/features/auth";

export async function signIn(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const signInUser = await makeSignIn();
  const result = await signInUser(Object.fromEntries(formData));
  if (!result.ok) return { error: result.error };
  redirect("/");
}

export async function signUp(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const signUpUser = await makeSignUp();
  const result = await signUpUser(Object.fromEntries(formData));
  if (!result.ok) return { error: result.error };
  if (result.value === "confirmation-required") {
    return { notice: "Conta criada! Confirme pelo link enviado ao seu e-mail e depois entre." };
  }
  redirect("/");
}

export async function signOut() {
  const signOutUser = await makeSignOut();
  await signOutUser();
  redirect("/login");
}
