import { useAuth } from "@/features/auth/useAuth";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";

export function SidebarUserCard() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11">
          <AvatarFallback>{user.avatarFallback}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Membership
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {user.membershipTier} Member
          </p>
        </div>
        <Button
          variant="secondary"
          className="w-full justify-center"
          onClick={logout}
        >
          Log out
        </Button>
      </div>
    </div>
  );
}
