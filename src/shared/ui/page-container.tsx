import type { ReactNode } from "react";
import { PageHeader } from "@/shared/ui/page-header";

interface PageContainerProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageContainer({
  title,
  subtitle,
  actions,
  children,
}: PageContainerProps) {
  return (
    <section className="space-y-8">
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      <div>{children}</div>
    </section>
  );
}
