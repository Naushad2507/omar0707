import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const userData = await login(email, password);
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      
      // Role-based redirection after login
      if (userData?.role === 'vendor') {
        navigate("/vendor/dashboard");
      } else if (userData?.role === 'customer') {
        navigate("/customer/dashboard");
      } else if (userData?.role === 'admin') {
        navigate("/admin/dashboard");
      } else if (userData?.role === 'superadmin') {
        navigate("/superadmin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-royal/5 flex items-center justify-center p-4">
      <div className="w-full max-w-[90vw] sm:max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Instoredealz</h1>
          </Link>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 px-4">Welcome back to your deals platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full py-3 px-3 text-sm sm:text-base border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <PasswordInput
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full py-3 px-3 text-sm sm:text-base border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Demo Accounts */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900 mb-2">Demo Accounts:</p>
                <div className="text-xs text-blue-800 space-y-1">
                  <p><strong>Customer:</strong> basic@example.com | customer123</p>
                  <p><strong>Vendor:</strong> vendor@example.com | vendor123</p>
                  <p><strong>Admin:</strong> admin@instoredealz.com | admin123</p>
                  <p className="text-blue-600 text-center mt-2">Email | Password</p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full py-3 text-sm sm:text-base font-medium" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
                <Link to="/" className="text-sm text-gray-500 hover:underline">
                  Back to Home
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
