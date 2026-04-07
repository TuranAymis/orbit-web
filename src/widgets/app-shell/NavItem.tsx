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
          "group relative flex items-center gap-4 rounded-none border border-transparent px-7 py-5 transition-all",
          isActive
            ? "bg-white/[0.04] text-foreground"
            : "text-muted-foreground hover:bg-white/[0.02] hover:text-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "absolute inset-y-3 left-0 w-1 rounded-r-full bg-primary opacity-0 transition",
              isActive && "opacity-100 shadow-[0_0_20px_rgba(182,100,255,0.9)]",
            )}
          />
          <span
            className={cn(
              "rounded-2xl p-2.5 transition-colors",
              isActive ? "bg-primary/16 text-primary" : "bg-white/[0.04] text-muted-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col text-left">
            <span className="text-sm font-semibold uppercase tracking-[0.18em]">{item.title}</span>
            <span className="truncate text-[11px] uppercase tracking-[0.22em] text-muted-foreground group-hover:text-muted-foreground">
              {item.description}
            </span>
          </span>
        </>
      )}
    </NavLink>
  );
}
