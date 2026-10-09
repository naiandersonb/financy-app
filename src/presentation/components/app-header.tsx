import Link from "next/link";
import { Wallet } from "lucide-react";
import type { ReactNode } from "react";

type AppHeaderProps = {
  /** Conteúdo do lado direito (ex.: menu do usuário). */
  children?: ReactNode;
};

export function AppHeader({ children }: AppHeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Wallet className="size-5 text-primary" aria-hidden="true" />
            Finanças
          </Link>
          <nav aria-label="Principal">
            <Link
              href="/categories"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Categorias
            </Link>
          </nav>
        </div>
        {children}
      </div>
    </header>
  );
}
