import { ToggleThemeButton } from "@/components/action-buttons";
import { HeaderMenu } from "@/components/layout/header-menu";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export default async function DashboardRootLayout({ children }: LayoutProps) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect("/login");
  }

  const metadata = claims.user_metadata ?? {};
  const name = (metadata.full_name ?? metadata.name ?? "Usuário") as string;
  const email = (claims.email ?? "") as string;
  const avatarUrl = metadata.avatar_url as string | undefined;

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950">
      <header className="flex flex-row items-center justify-between border-b border-border bg-neutral-50 p-4 dark:bg-neutral-950">
        <Logo />

        <div className="flex items-center gap-4">
          <ToggleThemeButton />
          <HeaderMenu name={name} email={email} avatarUrl={avatarUrl} />
        </div>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}
