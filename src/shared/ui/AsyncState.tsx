import type { ReactNode } from "react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";

interface AsyncStateProps {
  isLoading: boolean;
  error: Error | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingFallback?: ReactNode;
  children: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  errorTitle?: string;
  errorDescription?: string;
}

export function AsyncState({
  isLoading,
  error,
  isEmpty = false,
  onRetry,
  loadingFallback,
  children,
  emptyTitle = "Nothing to show yet",
  emptyDescription = "This section will populate once data is available.",
  errorTitle = "Something went wrong",
  errorDescription = "Try again to request fresh data.",
}: AsyncStateProps) {
  if (isLoading) {
    return <>{loadingFallback ?? <LoadingState />}</>;
  }

  if (error) {
    return (
      <ErrorState
        title={errorTitle}
        description={errorDescription}
        onAction={onRetry}
      />
    );
  }

  if (isEmpty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return <>{children}</>;
}
