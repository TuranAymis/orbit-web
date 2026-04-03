import { Bell, Menu, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { NotificationBadge } from "@/entities/notification/ui/NotificationBadge";
import { useUnreadNotifications } from "@/features/notifications/get-unread-count/model/useUnreadNotifications";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { NotificationPanel } from "@/widgets/notifications/NotificationPanel";

interface TopbarProps {
  onOpenSidebar: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { user } = useAuth();
  const { unreadCount } = useUnreadNotifications();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const navigate = useNavigate();

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
          <div className="absolute right-0 top-12 z-30">
            <NotificationPanel />
          </div>
        ) : null}
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Profile menu"
        onClick={() => navigate("/profile")}
      >
        <Avatar className="h-9 w-9">
          <AvatarFallback>{user?.avatarFallback ?? "OR"}</AvatarFallback>
        </Avatar>
      </Button>
    </header>
  );
}
