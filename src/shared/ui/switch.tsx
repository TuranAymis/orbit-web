import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

export function Switch({ className, checked, ...props }: SwitchProps) {
  return (
    <label className={cn("relative inline-flex cursor-pointer items-center", className)}>
      <input className="peer sr-only" type="checkbox" checked={checked} {...props} />
      <span className="h-8 w-14 rounded-full border border-white/10 bg-black/50 transition peer-checked:border-primary/40 peer-checked:bg-primary/30" />
      <span className="pointer-events-none absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-md transition peer-checked:left-7 peer-checked:bg-primary" />
    </label>
  );
}
