import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/widgets/app-shell/Sidebar";
import { Topbar } from "@/widgets/app-shell/Topbar";

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_28%)]" />
      <div className="fixed inset-0 bg-orbit-grid bg-[size:48px_48px] opacity-[0.18]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1600px] gap-4 p-3 md:gap-6 md:p-6">
        <div className="hidden w-[296px] shrink-0 md:block">
          <Sidebar />
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 bg-black/60 px-3 py-3 backdrop-blur-sm md:hidden">
            <div className="h-full max-w-[296px]">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
            <button
              type="button"
              aria-label="Close navigation menu"
              className="absolute inset-0 -z-10"
              onClick={() => setMobileOpen(false)}
            />
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col gap-4 md:gap-6">
          <Topbar onOpenSidebar={() => setMobileOpen(true)} />
          <main className="min-h-[calc(100vh-7rem)] rounded-[28px] border border-white/10 bg-black/25 p-4 shadow-shell backdrop-blur md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
