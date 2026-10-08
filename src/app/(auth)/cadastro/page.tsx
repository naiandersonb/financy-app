import type { Metadata } from "next";
import { signUp } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function SignUpPage() {
  return (
    <AuthForm
      title="Criar conta"
      description="Comece a organizar suas finanças mensais."
      submitLabel="Criar conta"
      action={signUp}
      passwordAutoComplete="new-password"
      alternative={{ prompt: "Já tem uma conta?", linkLabel: "Entrar", href: "/login" }}
    />
  );
}
