import { AppProviders } from "@/app/providers/AppProviders";
import { AppRouter } from "@/app/router/AppRouter";
import { UpdateBanner } from "@/shared/ui/UpdateBanner";
import { AppErrorBoundary } from "@/shared/lib/errors/AppErrorBoundary";

export default function App() {
  return (
    <AppErrorBoundary>
      <AppProviders>
        <AppRouter />
        <UpdateBanner />
      </AppProviders>
    </AppErrorBoundary>
  );
}
