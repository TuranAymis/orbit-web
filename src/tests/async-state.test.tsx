import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AsyncState } from "@/shared/ui/AsyncState";
import { LoadingState } from "@/shared/ui/LoadingState";

describe("AsyncState", () => {
  it("renders a shared loading state fallback", () => {
    render(
      <AsyncState
        isLoading
        error={null}
        loadingFallback={<LoadingState data-testid="async-loading" />}
      >
        <div>Loaded content</div>
      </AsyncState>,
    );

    expect(screen.getByTestId("async-loading")).toBeInTheDocument();
    expect(screen.queryByText(/loaded content/i)).not.toBeInTheDocument();
  });

  it("renders an error state with retry action", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <AsyncState
        isLoading={false}
        error={new Error("Request failed")}
        onRetry={onRetry}
        errorTitle="Section failed"
        errorDescription="Retry this section."
      >
        <div>Loaded content</div>
      </AsyncState>,
    );

    expect(screen.getByText(/section failed/i)).toBeInTheDocument();
    expect(screen.getByText(/retry this section/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders an empty state when data is absent", () => {
    render(
      <AsyncState
        isLoading={false}
        error={null}
        isEmpty
        emptyTitle="Nothing here yet"
        emptyDescription="Try again later."
      >
        <div>Loaded content</div>
      </AsyncState>,
    );

    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
    expect(screen.getByText(/try again later/i)).toBeInTheDocument();
  });

  it("renders children when data is available", () => {
    render(
      <AsyncState isLoading={false} error={null}>
        <div>Loaded content</div>
      </AsyncState>,
    );

    expect(screen.getByText(/loaded content/i)).toBeInTheDocument();
  });
});
