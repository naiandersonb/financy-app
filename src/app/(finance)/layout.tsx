import { makeGetCurrentUser } from "@/main";
import { AppHeader } from "@/presentation/components/app-header";
import { UserMenu } from "@/presentation/features/auth";
import { redirect } from "next/navigation";
import { signOut } from "../(auth)/actions";

export default async function FinanceLayout({ children }: LayoutProps<"/">) {
  const getCurrentUser = await makeGetCurrentUser();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <AppHeader>
        <UserMenu
          name={user.name}
          email={user.email}
          avatarUrl={user.avatarUrl}
          onSignOut={signOut}
        />
      </AppHeader>
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
