import { useAuth, hasRole } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(redirectTo);
      return;
    }

    if (!hasRole(user, allowedRoles)) {
      // Redirect to appropriate dashboard based on user role
      if (user?.role === "customer") {
        navigate("/customer/dashboard");
      } else if (user?.role === "vendor") {
        navigate("/vendor/dashboard");
      } else if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user?.role === "superadmin") {
        navigate("/superadmin/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, user, allowedRoles, navigate, redirectTo]);

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show access denied if user doesn't have required role
  if (!hasRole(user, allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
