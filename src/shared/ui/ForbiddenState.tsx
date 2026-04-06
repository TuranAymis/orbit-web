import { ShieldAlert } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

interface ForbiddenStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ForbiddenState({
  title = "You don't have access to this area",
  description = "Orbit checks your permissions before allowing access to this workflow.",
  actionLabel,
  onAction,
}: ForbiddenStateProps) {
  return (
    <Card className="border-destructive/25 bg-destructive/5">
      <CardContent className="flex flex-col items-start gap-4 py-10">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10">
          <ShieldAlert className="h-5 w-5 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>
        </div>
        {actionLabel && onAction ? (
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
