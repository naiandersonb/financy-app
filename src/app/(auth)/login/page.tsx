import type { Metadata } from "next";
import { signIn } from "../actions";
import { AuthForm } from "@/presentation/features/auth";

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
