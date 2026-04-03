import type { PropsWithChildren, ReactNode } from "react";
import { Component } from "react";
import { ErrorState } from "@/shared/ui/ErrorState";

interface AppErrorBoundaryProps extends PropsWithChildren {
  fallback?: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("Orbit app error boundary caught an error", error);
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen bg-background p-6">
            <div className="mx-auto max-w-3xl pt-16">
              <ErrorState
                title="Orbit hit an unexpected error"
                description="The current screen failed to render. Try again to reset the app shell."
                actionLabel="Try again"
                onAction={this.handleReset}
              />
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
