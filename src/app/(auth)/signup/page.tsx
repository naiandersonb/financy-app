import type { Metadata } from "next";
import { AuthForm } from "@/presentation/features/auth";
import { signInWithGoogle, signUp } from "../actions";

export const metadata: Metadata = { title: "Criar conta" };

export default function SignUpPage() {
  return (
    <AuthForm
      title="Criar conta"
      description="Comece a organizar suas finanças mensais."
      submitLabel="Criar conta"
      action={signUp}
      onGoogleSignIn={signInWithGoogle}
      passwordAutoComplete="new-password"
      alternative={{ prompt: "Já tem uma conta?", linkLabel: "Entrar", href: "/login" }}
    />
  );
}
