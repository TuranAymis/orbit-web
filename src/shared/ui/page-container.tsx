import type { ReactNode } from "react";
import { PageHeader } from "@/shared/ui/page-header";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
}

export function PageContainer({
  title,
  subtitle,
  actions,
  children,
  className,
  contentClassName,
  headerClassName,
}: PageContainerProps) {
  return (
    <section className={cn("space-y-8", className)}>
      <PageHeader title={title} subtitle={subtitle} actions={actions} className={headerClassName} />
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
