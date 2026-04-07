import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-4",
        className,
      )}
    >
      <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      {hint ? <div className="mt-2 text-sm text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
