import { redirect } from "next/navigation";
import { makeGetCurrentUser } from "@/main";
import { AppHeader } from "@/presentation/components/app-header";
import { UserMenu } from "@/presentation/features/auth";
import { signOut } from "../(auth)/actions";

export default async function FinanceLayout({ children }: LayoutProps<"/">) {
  const getCurrentUser = await makeGetCurrentUser();
  const user = await getCurrentUser();
  // O proxy já protege estas rotas; isto cobre uma sessão que expirou no meio do caminho.
  if (!user) redirect("/login");

  return (
    <>
      <AppHeader>
        <UserMenu email={user.email} onSignOut={signOut} />
      </AppHeader>
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
