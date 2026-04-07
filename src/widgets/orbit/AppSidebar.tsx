import { Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { SidebarNav } from "@/widgets/app-shell/SidebarNav";

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-[30px] border border-white/8 bg-[#0d0d12]">
      <div className="border-b border-white/6 px-7 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/14 text-primary shadow-[0_0_0_1px_rgba(182,100,255,0.18)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[2rem] font-bold uppercase leading-none tracking-[-0.04em] text-primary">
              Orbit
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Synthetic network
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-0 py-4">
        <SidebarNav onNavigate={onNavigate} />
      </div>

      <div className="border-t border-white/6 px-7 py-6">
        <Button className="mb-5 w-full justify-center uppercase tracking-[0.18em]">
          Upgrade to Pro
        </Button>

        {user ? (
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 rounded-2xl">
                <AvatarFallback>{user.avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                <p className="truncate text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {user.membershipTier} Member
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="mt-4 w-full justify-center border border-white/8"
              onClick={logout}
            >
              Log out
            </Button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
