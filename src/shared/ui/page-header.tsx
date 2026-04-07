import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-2 md:flex-row md:items-start md:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-3xl text-base leading-8 text-muted-foreground md:text-xl">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}
