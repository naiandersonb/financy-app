import type { Metadata } from "next";
import { AuthForm, oauthErrorMessage } from "@/presentation/features/auth";
import { signIn, signInWithGoogle } from "../actions";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  return (
    <AuthForm
      title="Entrar"
      description="Acesse sua conta para continuar."
      submitLabel="Entrar"
      action={signIn}
      onGoogleSignIn={signInWithGoogle}
      initialError={oauthErrorMessage(error)}
      passwordAutoComplete="current-password"
      alternative={{ prompt: "Não tem uma conta?", linkLabel: "Cadastre-se", href: "/signup" }}
    />
  );
}
