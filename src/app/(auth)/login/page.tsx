import type { Metadata } from "next";
import { signIn } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <AuthForm
      title="Entrar"
      description="Acesse sua conta para continuar."
      submitLabel="Entrar"
      action={signIn}
      passwordAutoComplete="current-password"
      alternative={{ prompt: "Não tem uma conta?", linkLabel: "Cadastre-se", href: "/cadastro" }}
    />
  );
}
