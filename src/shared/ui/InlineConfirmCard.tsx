import type { ReactNode } from "react";
import { useId } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

interface InlineConfirmCardProps {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: ReactNode;
}

export function InlineConfirmCard({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  isConfirming = false,
  onConfirm,
  onCancel,
  icon,
}: InlineConfirmCardProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Card
      className="border-destructive/30 bg-destructive/5"
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-modal="false"
    >
      <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {icon}
            <h2 id={titleId} className="text-base font-semibold text-foreground">
              {title}
            </h2>
          </div>
          <p id={descriptionId} className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="outline" disabled={isConfirming} onClick={onConfirm}>
            {isConfirming ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
