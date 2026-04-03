import type { NavigationItem } from "@/config/navigation";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItemProps {
  item: NavigationItem;
  onNavigate?: () => void;
}

export function NavItem({ item, onNavigate }: NavItemProps) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group flex items-start gap-3 rounded-xl border px-3 py-3 transition-all",
          isActive
            ? "border-primary/40 bg-primary/12 text-foreground shadow-[0_0_0_1px_rgba(168,85,247,0.1)]"
            : "border-transparent bg-transparent text-muted-foreground hover:border-white/10 hover:bg-white/5 hover:text-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "mt-0.5 rounded-lg p-2 transition-colors",
              isActive ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col text-left">
            <span className="text-sm font-medium">{item.title}</span>
            <span className="truncate text-xs text-muted-foreground group-hover:text-muted-foreground">
              {item.description}
            </span>
          </span>
        </>
      )}
    </NavLink>
  );
}
