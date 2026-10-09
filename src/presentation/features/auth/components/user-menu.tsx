"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/presentation/components/button";

type UserMenuProps = {
  email: string | null;
  onSignOut: () => Promise<void>;
};

export function UserMenu({ email, onSignOut }: UserMenuProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {email && (
        <span className="truncate text-sm text-muted-foreground" title={email}>
          {email}
        </span>
      )}
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
