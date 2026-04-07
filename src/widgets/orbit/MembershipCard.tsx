import { Check, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { cn } from "@/lib/utils";

interface MembershipCardProps {
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  isActive?: boolean;
  actionLabel: string;
  actionAriaLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
}

export function MembershipCard({
  title,
  price,
  subtitle,
  features,
  isActive = false,
  actionLabel,
  actionAriaLabel,
  onAction,
  disabled = false,
}: MembershipCardProps) {
  return (
    <Card
      className={cn(
        "h-full border-white/8 bg-[#15151b]",
        isActive &&
          "border-primary/30 shadow-[0_0_0_1px_rgba(182,100,255,0.22),0_18px_50px_rgba(182,100,255,0.18)]",
      )}
    >
      <CardContent className="flex h-full flex-col p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[2rem] font-bold tracking-tight text-foreground">{title}</h3>
            <p className="mt-1 text-sm uppercase tracking-[0.22em] text-muted-foreground">
              {subtitle}
            </p>
          </div>
          {isActive ? <Sparkles className="h-5 w-5 text-primary" /> : null}
        </div>

        <p className="mt-5 text-4xl font-bold tracking-tight text-primary">{price}</p>

        <div className="mt-8 space-y-4">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3 text-sm text-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="h-3.5 w-3.5" />
              </span>
              {feature}
            </div>
          ))}
        </div>

        <Button
          className="mt-auto w-full justify-center uppercase tracking-[0.18em]"
          variant={isActive ? "default" : "secondary"}
          aria-label={actionAriaLabel ?? actionLabel}
          disabled={disabled}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
