"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/presentation/components/button";
import { UserAvatar } from "./user-avatar";

type UserMenuProps = {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  onSignOut: () => Promise<void>;
};

export function UserMenu({ name, email, avatarUrl, onSignOut }: UserMenuProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar name={name} email={email} avatarUrl={avatarUrl} />
      <div className="flex min-w-0 flex-col leading-tight">
        {name && <span className="truncate text-sm font-medium">{name}</span>}
        {email && (
          <span
            className={name ? "truncate text-xs text-muted-foreground" : "truncate text-sm text-muted-foreground"}
            title={email}
          >
            {email}
          </span>
        )}
      </div>
      <form action={onSignOut}>
        <SignOutButton />
      </form>
    </div>
  );
}

function SignOutButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      <LogOut aria-hidden="true" />
      {pending ? "Saindo…" : "Sair"}
    </Button>
  );
}
