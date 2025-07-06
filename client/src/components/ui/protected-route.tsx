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
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation(redirectTo);
      return;
    }

    if (!hasRole(user, allowedRoles)) {
      // Redirect to appropriate dashboard based on user role
      if (user?.role === "customer") {
        setLocation("/customer/dashboard");
      } else if (user?.role === "vendor") {
        setLocation("/vendor/dashboard");
      } else if (user?.role === "admin") {
        setLocation("/admin/dashboard");
      } else if (user?.role === "superadmin") {
        setLocation("/superadmin/dashboard");
      } else {
        setLocation("/");
      }
    }
  }, [isAuthenticated, user, allowedRoles, setLocation, redirectTo]);

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
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center"
            >
              ← Go Back
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
            >
              🏠 Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
