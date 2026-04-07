import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabItem<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  ariaLabel?: string;
}

interface TabsProps<T extends string> {
  items: Array<TabItem<T>>;
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
}

export function Tabs<T extends string>({
  items,
  value,
  onValueChange,
  className,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex flex-wrap items-center gap-2 rounded-[22px] border border-white/8 bg-white/[0.03] p-1.5",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={item.ariaLabel ?? item.label}
            className={cn(
              "inline-flex items-center gap-2 rounded-[16px] px-4 py-2.5 text-sm font-medium transition",
              isActive
                ? "bg-primary/16 text-foreground shadow-[0_0_0_1px_rgba(182,100,255,0.24),0_12px_32px_rgba(182,100,255,0.16)]"
                : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
            )}
            onClick={() => onValueChange(item.value)}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
