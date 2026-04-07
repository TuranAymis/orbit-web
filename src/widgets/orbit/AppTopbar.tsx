import { Bell, Menu, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { useUnreadNotifications } from "@/features/notifications/get-unread-count/model/useUnreadNotifications";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { NotificationBadge } from "@/entities/notification/ui/NotificationBadge";
import { NotificationPanel } from "@/widgets/notifications/NotificationPanel";

interface AppTopbarProps {
  onOpenSidebar: () => void;
}

export function AppTopbar({ onOpenSidebar }: AppTopbarProps) {
  const { user } = useAuth();
  const { unreadCount } = useUnreadNotifications();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header
      role="banner"
      className="sticky top-0 z-20 flex items-center gap-3 rounded-[24px] border border-white/8 bg-[#111117]/95 px-4 py-3 backdrop-blur xl:px-5"
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

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Search"
          placeholder="Deep search..."
          className="border-white/8 bg-black/75 pl-11"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            aria-expanded={isNotificationPanelOpen}
            onClick={() => setIsNotificationPanelOpen((current) => !current)}
          >
            <span className="relative inline-flex">
              <Bell className="h-5 w-5" />
              <NotificationBadge count={unreadCount} />
            </span>
          </Button>
          {isNotificationPanelOpen ? (
            <div className="absolute right-0 top-14 z-30">
              <NotificationPanel />
            </div>
          ) : null}
        </div>

        <button
          type="button"
          aria-label="Profile menu"
          className="rounded-[18px] border border-primary/20 p-1.5 transition hover:border-primary/40 hover:bg-white/[0.04]"
          onClick={() => navigate("/profile")}
        >
          <Avatar className="h-10 w-10 rounded-[14px] border-white/10">
            <AvatarFallback>{user?.avatarFallback ?? "OR"}</AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
}
