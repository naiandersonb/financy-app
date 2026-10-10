import Image from "next/image";
import { isAllowedAvatarUrl } from "../avatar-hosts";

type UserAvatarProps = {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
};

/** Foto da conta (só de hosts permitidos) ou a inicial do nome (ou do e-mail). Decorativo: o texto fica ao lado. */
export function UserAvatar({ name, email, avatarUrl }: UserAvatarProps) {
  if (isAllowedAvatarUrl(avatarUrl)) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={32}
        height={32}
        className="size-8 shrink-0 rounded-full"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
    >
      {(name ?? email)?.charAt(0).toUpperCase() || "?"}
    </span>
  );
}
