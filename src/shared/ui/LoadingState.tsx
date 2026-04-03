import { cn } from "@/lib/utils";

interface LoadingStateProps {
  "data-testid"?: string;
  className?: string;
  lines?: number;
}

export function LoadingState({
  "data-testid": dataTestId,
  className,
  lines = 3,
}: LoadingStateProps) {
  return (
    <div
      data-testid={dataTestId}
      className={cn("space-y-3 rounded-3xl border border-white/10 bg-white/[0.03] p-6", className)}
    >
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-5 animate-pulse rounded-full bg-white/10",
            index === 0 ? "w-2/3" : index === lines - 1 ? "w-1/2" : "w-full",
          )}
        />
      ))}
    </div>
  );
}
