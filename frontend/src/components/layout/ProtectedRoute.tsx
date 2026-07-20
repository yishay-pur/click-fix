import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { UserRole } from "../../types";
import { PageLoader } from "../common";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (
    allowedRoles &&
    (((user?.isAdmin || user?.isManager) && allowedRoles.includes(user.role)) ||
      !allowedRoles.includes(user?.role || "guest"))
  ) {
    // Redirect to appropriate dashboard based on role
    const roleRedirects: Record<UserRole, string> = {
      customer: "/dashboard",
      professional: "/pro/dashboard",
      admin: "/admin",
      manager: "/admin",
      guest: "/",
    };

    return <Navigate to={roleRedirects[user?.role?? "guest"]} replace />;
  }

  return <Outlet />;
}
