import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft, Home, LogIn } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

export default function AccessDenied() {
  const { user } = useAuth();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <ShieldX className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              {user 
                ? "You don't have permission to access this page. Your current role doesn't allow access to this section."
                : "You need to be logged in to access this page."
              }
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {!user ? (
              <Button asChild className="flex items-center">
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            ) : (
              <Button asChild className="flex items-center">
                <Link to={
                  user.role === 'customer' ? '/customer/dashboard' :
                  user.role === 'vendor' ? '/vendor/dashboard' :
                  user.role === 'admin' ? '/admin/dashboard' :
                  user.role === 'superadmin' ? '/superadmin/dashboard' :
                  '/'
                }>
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
            )}
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="flex items-center flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button asChild variant="outline" className="flex items-center flex-1">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}