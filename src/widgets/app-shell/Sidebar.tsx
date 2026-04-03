import { Sparkles } from "lucide-react";
import { Separator } from "@/shared/ui/separator";
import { SidebarNav } from "@/widgets/app-shell/SidebarNav";
import { SidebarUserCard } from "@/widgets/app-shell/SidebarUserCard";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur">
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/20 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">Orbit</p>
          <p className="text-xs text-muted-foreground">Developer community hub</p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex-1 overflow-y-auto pr-1">
        <SidebarNav onNavigate={onNavigate} />
      </div>
      <Separator className="my-4" />
      <SidebarUserCard />
    </aside>
  );
}
