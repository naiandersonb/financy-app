"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/presentation/components/button";
import { Input } from "@/presentation/components/input";
import { Label } from "@/presentation/components/label";
import { GoogleSignInButton } from "./google-sign-in-button";

export type AuthFormState = { error?: string; notice?: string };

type AuthFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  action: (previous: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  passwordAutoComplete: "current-password" | "new-password";
  onGoogleSignIn: () => Promise<void>;
  /** Erro vindo de fora do formulário, como o retorno do login com Google. */
  initialError?: string;
  alternative: { prompt: string; linkLabel: string; href: string };
};

export function AuthForm({
  title,
  description,
  submitLabel,
  action,
  passwordAutoComplete,
  onGoogleSignIn,
  initialError,
  alternative,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, { error: initialError });

  return (
    <main className="flex flex-1 items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>

        <div className="mt-6">
          <GoogleSignInButton onGoogleSignIn={onGoogleSignIn} />
        </div>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          ou
          <span className="h-px flex-1 bg-border" />
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="voce@exemplo.com"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={passwordAutoComplete}
                required
                placeholder="••••••••"
                className="pl-9"
              />
            </div>
          </div>

          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          {state.notice && (
            <p role="status" className="text-sm text-primary">
              {state.notice}
            </p>
          )}

          <Button type="submit" className="mt-2 w-full" disabled={pending}>
            {pending ? "Aguarde…" : submitLabel}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {alternative.prompt}{" "}
          <Link href={alternative.href} className="font-medium text-primary hover:underline">
            {alternative.linkLabel}
          </Link>
        </p>
      </div>
    </main>
  );
}
