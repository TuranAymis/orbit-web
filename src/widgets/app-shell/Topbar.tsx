import { AppTopbar } from "@/widgets/orbit/AppTopbar";

interface TopbarProps {
  onOpenSidebar: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  return <AppTopbar onOpenSidebar={onOpenSidebar} />;
}
