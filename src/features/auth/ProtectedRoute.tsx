import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";

export function ProtectedRoute() {
  const { authReady, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (!authReady || isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
