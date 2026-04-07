import { AppSidebar } from "@/widgets/orbit/AppSidebar";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return <AppSidebar onNavigate={onNavigate} />;
}
