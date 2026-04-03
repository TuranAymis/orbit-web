import { useRevalidator, useRouteError } from "react-router-dom";
import { ErrorState } from "@/shared/ui/ErrorState";

export function RouteErrorBoundary() {
  const error = useRouteError();
  const revalidator = useRevalidator();

  const description =
    error instanceof Error
      ? error.message
      : "This route failed to render. Retry to request a fresh route tree.";

  return (
    <div className="mx-auto max-w-4xl p-6 pt-10">
      <ErrorState
        title="This route is temporarily unavailable"
        description={description}
        actionLabel={revalidator.state === "loading" ? "Retrying..." : "Retry"}
        onAction={() => revalidator.revalidate()}
      />
    </div>
  );
}
