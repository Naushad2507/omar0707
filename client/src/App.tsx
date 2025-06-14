import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./lib/auth";
import { useEffect } from "react";

// Import pages
import Home from "@/pages/shared/home";
import Login from "@/pages/shared/login";
import Signup from "@/pages/shared/signup";
import Pricing from "@/pages/shared/pricing";
import Terms from "@/pages/shared/terms";
import Privacy from "@/pages/shared/privacy";

// Customer pages
import CustomerDashboard from "@/pages/customer/dashboard";
import CustomerDeals from "@/pages/customer/deals";
import ClaimHistory from "@/pages/customer/claim-history";

// Vendor pages
import VendorRegister from "@/pages/vendor/register";
import VendorDashboard from "@/pages/vendor/dashboard";
import VendorDeals from "@/pages/vendor/deals";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminVendors from "@/pages/admin/vendors";
import AdminDeals from "@/pages/admin/deals";

// Super Admin pages
import SuperAdminDashboard from "@/pages/superadmin/dashboard";
import AdminManagement from "@/pages/superadmin/admin-management";
import SystemLogs from "@/pages/superadmin/logs";

import NotFound from "@/pages/not-found";
import ProtectedRoute from "@/components/ui/protected-route";

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
      
      {/* Customer routes */}
      <Route path="/customer/dashboard">
        <ProtectedRoute allowedRoles={['customer']}>
          <CustomerDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/customer/deals">
        <ProtectedRoute allowedRoles={['customer']}>
          <CustomerDeals />
        </ProtectedRoute>
      </Route>
      <Route path="/customer/claims">
        <ProtectedRoute allowedRoles={['customer']}>
          <ClaimHistory />
        </ProtectedRoute>
      </Route>
      
      {/* Vendor routes */}
      <Route path="/vendor/register">
        <ProtectedRoute allowedRoles={['vendor']}>
          <VendorRegister />
        </ProtectedRoute>
      </Route>
      <Route path="/vendor/dashboard">
        <ProtectedRoute allowedRoles={['vendor']}>
          <VendorDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/vendor/deals">
        <ProtectedRoute allowedRoles={['vendor']}>
          <VendorDeals />
        </ProtectedRoute>
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin/dashboard">
        <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminUsers />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/vendors">
        <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminVendors />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/deals">
        <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminDeals />
        </ProtectedRoute>
      </Route>
      
      {/* Super Admin routes */}
      <Route path="/superadmin/dashboard">
        <ProtectedRoute allowedRoles={['superadmin']}>
          <SuperAdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/superadmin/admins">
        <ProtectedRoute allowedRoles={['superadmin']}>
          <AdminManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/superadmin/logs">
        <ProtectedRoute allowedRoles={['superadmin']}>
          <SystemLogs />
        </ProtectedRoute>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
