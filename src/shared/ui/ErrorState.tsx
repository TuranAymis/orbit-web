import { RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface ErrorStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({
  title,
  description,
  actionLabel = "Retry",
  onAction,
}: ErrorStateProps) {
  return (
    <section className="rounded-3xl border border-destructive/25 bg-destructive/5 px-6 py-10 text-center">
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      {onAction ? (
        <Button className="mt-6" variant="outline" onClick={onAction}>
          <RefreshCw className="h-4 w-4" />
          {actionLabel}
        </Button>
      ) : null}
    </section>
  );
}
