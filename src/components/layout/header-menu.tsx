import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type HeaderMenuProps = {
  avatarUrl?: string
  name: string
  email: string
}
export const HeaderMenu = ({ email, name, avatarUrl }: HeaderMenuProps) => {
  const initials = name.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-2">
      <Avatar>
        {avatarUrl ? <AvatarImage src={avatarUrl} /> : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="text-xs">
        <p className="font-bold text-foreground">{name}</p>
        <p className="text-muted-foreground">{email}</p>
      </div>
    </div>
  )
}
