import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./lib/auth";

// Import pages
import Home from "@/pages/shared/home";
import Login from "@/pages/shared/login";
import Signup from "@/pages/shared/signup";
import Pricing from "@/pages/shared/pricing";
import Terms from "@/pages/shared/terms";
import Privacy from "@/pages/shared/privacy";
import Help from "@/pages/shared/help";

// Customer pages
import CustomerDashboard from "@/pages/customer/dashboard";
import CustomerDeals from "@/pages/customer/deals";
import SecureDeals from "@/pages/customer/secure-deals";
import ClaimHistory from "@/pages/customer/claim-history";
import CustomerWishlist from "@/pages/customer/wishlist";
import MembershipCard from "@/pages/customer/membership-card";
import DealDetail from "@/pages/customer/deal-detail";
import UpgradeMembership from "@/pages/customer/upgrade-membership";

// Vendor pages
import VendorBenefits from "@/pages/vendor/benefits";
import VendorRegister from "@/pages/vendor/register-enhanced";
import VendorDashboard from "@/pages/vendor/dashboard";
import VendorDeals from "@/pages/vendor/deals";
import VendorAnalytics from "@/pages/vendor/analytics";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminVendors from "@/pages/admin/vendors";
import AdminDeals from "@/pages/admin/deals";
import AdminDealDistribution from "@/pages/admin/deal-distribution";

// Super Admin pages
import SuperAdminDashboard from "@/pages/superadmin/dashboard";
import SystemLogs from "@/pages/superadmin/logs";

import NotFound from "@/pages/not-found";
import TestFlows from "@/pages/test-flows";
import DealList from "@/components/DealList";
import SubscriptionButton from "@/components/Subscription";
import VendorPortal from "@/components/VendorPortal";

// Role-based route protection component with TypeScript
interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  fallbackPath = "/login" 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setLocation(fallbackPath);
        return;
      }
      
      if (user && !allowedRoles.includes(user.role)) {
        setLocation("/unauthorized");
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, fallbackPath, setLocation]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
};

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/help" component={Help} />
      <Route path="/test" component={TestFlows} />
      
      {/* Public deal browsing */}
      <Route path="/deals" component={DealList} />
      
      {/* Public deal detail route */}
      <Route path="/deals/:id" component={DealDetail} />

      {/* Customer routes with role protection */}
      <Route path="/customer" component={() => 
        <RoleProtectedRoute allowedRoles={['customer']}>
          <DealList />
        </RoleProtectedRoute>
      } />
      
      <Route path="/customer/subscription" component={() => 
        <RoleProtectedRoute allowedRoles={['customer']}>
          <SubscriptionButton />
        </RoleProtectedRoute>
      } />
      
      <Route path="/customer/dashboard" component={() => 
        <RoleProtectedRoute allowedRoles={['customer']}>
          <CustomerDashboard />
        </RoleProtectedRoute>
      } />
      
      <Route path="/customer/deals" component={() => 
        <RoleProtectedRoute allowedRoles={['customer']}>
          <CustomerDeals />
        </RoleProtectedRoute>
      } />
      
      <Route path="/customer/secure-deals" component={() => 
        <RoleProtectedRoute allowedRoles={['customer']}>
          <SecureDeals />
        </RoleProtectedRoute>
      } />
      
      <Route path="/customer/claims" component={() => 
        <RoleProtectedRoute allowedRoles={['customer']}>
          <ClaimHistory />
        </RoleProtectedRoute>
      } />
      
      <Route path="/customer/wishlist" component={() => 
        <RoleProtectedRoute allowedRoles={['customer']}>
          <CustomerWishlist />
        </RoleProtectedRoute>
      } />
      
      <Route path="/customer/membership-card" component={() => 
        <RoleProtectedRoute allowedRoles={['customer']}>
          <MembershipCard />
        </RoleProtectedRoute>
      } />
      
      <Route path="/customer/upgrade" component={() => 
        <RoleProtectedRoute allowedRoles={['customer']}>
          <UpgradeMembership />
        </RoleProtectedRoute>
      } />

      {/* Vendor routes with role protection */}
      <Route path="/vendor" component={() => 
        <RoleProtectedRoute allowedRoles={['vendor', 'customer']} fallbackPath="/vendor/portal">
          <VendorPortal />
        </RoleProtectedRoute>
      } />
      
      <Route path="/vendor/portal" component={VendorPortal} />
      
      <Route path="/vendor/benefits" component={VendorBenefits} />
      
      <Route path="/vendor/register" component={() => 
        <RoleProtectedRoute allowedRoles={['vendor']}>
          <VendorRegister />
        </RoleProtectedRoute>
      } />
      
      <Route path="/vendor/dashboard" component={() => 
        <RoleProtectedRoute allowedRoles={['vendor']}>
          <VendorDashboard />
        </RoleProtectedRoute>
      } />
      
      <Route path="/vendor/deals" component={() => 
        <RoleProtectedRoute allowedRoles={['vendor']}>
          <VendorDeals />
        </RoleProtectedRoute>
      } />
      
      <Route path="/vendor/analytics" component={() => 
        <RoleProtectedRoute allowedRoles={['vendor']}>
          <VendorAnalytics />
        </RoleProtectedRoute>
      } />

      {/* Admin routes with role protection */}
      <Route path="/admin" component={() => 
        <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminDashboard />
        </RoleProtectedRoute>
      } />
      
      <Route path="/admin/dashboard" component={() => 
        <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminDashboard />
        </RoleProtectedRoute>
      } />
      
      <Route path="/admin/users" component={() => 
        <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminUsers />
        </RoleProtectedRoute>
      } />
      
      <Route path="/admin/vendors" component={() => 
        <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminVendors />
        </RoleProtectedRoute>
      } />
      
      <Route path="/admin/deals" component={() => 
        <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminDeals />
        </RoleProtectedRoute>
      } />

      {/* Super Admin routes with role protection */}
      <Route path="/superadmin" component={() => 
        <RoleProtectedRoute allowedRoles={['superadmin']}>
          <SuperAdminDashboard />
        </RoleProtectedRoute>
      } />
      
      <Route path="/superadmin/dashboard" component={() => 
        <RoleProtectedRoute allowedRoles={['superadmin']}>
          <SuperAdminDashboard />
        </RoleProtectedRoute>
      } />
      
      <Route path="/superadmin/logs" component={() => 
        <RoleProtectedRoute allowedRoles={['superadmin']}>
          <SystemLogs />
        </RoleProtectedRoute>
      } />

      {/* Unauthorized page */}
      <Route path="/unauthorized" component={() => (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-lg text-gray-600 mb-8">You don't have permission to access this page.</p>
          <button 
            onClick={() => window.history.back()} 
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      )} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { user, updateToken } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token && !user) {
      updateToken(token);
    }
  }, [user, updateToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;