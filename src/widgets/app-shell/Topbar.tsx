import { Bell, Menu, Search } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface TopbarProps {
  onOpenSidebar: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header
      role="banner"
      className="sticky top-0 z-20 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur"
    >
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation menu"
        onClick={onOpenSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Search"
          placeholder="Search communities, groups, events"
          className="pl-9"
        />
      </div>
      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Profile menu">
        <Avatar className="h-9 w-9">
          <AvatarFallback>{user?.avatarFallback ?? "OR"}</AvatarFallback>
        </Avatar>
      </Button>
    </header>
  );
}
