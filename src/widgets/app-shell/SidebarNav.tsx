import { navigationItems } from "@/config/navigation";
import { NavItem } from "@/widgets/app-shell/NavItem";

interface SidebarNavProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  return (
    <nav aria-label="Primary" className="space-y-2">
      {navigationItems.map((item) => (
        <NavItem key={item.to} item={item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}
