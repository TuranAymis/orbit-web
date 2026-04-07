import type { ReactNode } from "react";

interface DiscoverSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function DiscoverSection({
  title,
  description,
  children,
}: DiscoverSectionProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}
