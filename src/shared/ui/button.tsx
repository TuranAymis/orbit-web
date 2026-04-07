import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "ghost" | "secondary" | "outline";
type ButtonSize = "default" | "icon" | "sm";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "border border-primary/30 bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(182,100,255,0.24)] hover:bg-primary/90 hover:shadow-[0_12px_34px_rgba(182,100,255,0.34)] focus-visible:ring-primary/60",
  ghost:
    "border border-transparent bg-transparent text-foreground hover:bg-white/[0.04] focus-visible:ring-white/20",
  secondary:
    "border border-white/8 bg-white/[0.06] text-foreground hover:bg-white/[0.09] focus-visible:ring-white/20",
  outline:
    "border border-white/10 bg-transparent text-foreground hover:border-primary/20 hover:bg-white/[0.03] focus-visible:ring-white/20",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-5 py-2.5",
  sm: "h-9 px-3 py-2 text-sm",
  icon: "h-11 w-11",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[16px] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";

export { Button };
