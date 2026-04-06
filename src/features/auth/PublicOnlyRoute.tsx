import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";

export function PublicOnlyRoute() {
  const { authReady, isAuthenticated, isLoading } = useAuth();

  if (!authReady || isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/discover" replace />;
  }

  return <Outlet />;
}
