import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/widgets/orbit/AppSidebar";
import { AppTopbar } from "@/widgets/orbit/AppTopbar";

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isChatPage = useLocation().pathname === "/chat";

  return (
    <div className={cn("min-h-screen bg-background text-foreground", isChatPage && "h-dvh min-h-0 overflow-hidden")}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(182,100,255,0.10),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(78,221,255,0.05),_transparent_15%)]" />
      <div className="fixed inset-0 bg-orbit-grid bg-[size:54px_54px] opacity-[0.06]" />
      <div className={cn("relative mx-auto flex min-h-screen max-w-[1720px] gap-4 p-3 md:gap-6 md:p-6", isChatPage && "h-full min-h-0 overflow-hidden")}>
        <div className="hidden w-[320px] shrink-0 md:block">
          <AppSidebar />
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 bg-black/60 px-3 py-3 backdrop-blur-sm md:hidden">
            <div className="h-full max-w-[320px]">
              <AppSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
            <button
              type="button"
              aria-label="Close navigation menu"
              className="absolute inset-0 -z-10"
              onClick={() => setMobileOpen(false)}
            />
          </div>
        ) : null}

        <div className="flex min-w-0 min-h-0 flex-1 flex-col gap-4 md:gap-6">
          <AppTopbar onOpenSidebar={() => setMobileOpen(true)} />
          <main className={cn("min-h-[calc(100vh-7rem)] rounded-[30px] border border-white/8 bg-[#0f0f15]/90 p-4 shadow-shell backdrop-blur md:p-8", isChatPage && "min-h-0 flex-1 overflow-hidden p-2 sm:p-4 lg:p-6")}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
