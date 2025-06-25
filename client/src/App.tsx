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
import VendorDeals from "@/pages/vendor/deals-enhanced";
import VendorAnalytics from "@/pages/vendor/analytics";

// Customer wizard
import DealWizard from "@/pages/customer/deal-wizard";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminVendors from "@/pages/admin/vendors";
import AdminDeals from "@/pages/admin/deals";
// import AdminVendorsPending from "@/pages/admin/vendors-pending";
// import AdminDealsPending from "@/pages/admin/deals-pending";
import AdminDealDistribution from "@/pages/admin/deal-distribution";

// Super Admin pages
import SuperAdminDashboard from "@/pages/superadmin/dashboard";
import AdminManagement from "@/pages/superadmin/admin-management";
import SystemLogs from "@/pages/superadmin/logs";

import NotFound from "@/pages/not-found";
import ProtectedRoute from "@/components/ui/protected-route";
import TestFlows from "@/pages/test-flows";
import DealList from "@/components/DealList";
import CategoryList from "@/components/CategoryList";

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
      <Route path="/deals-list" component={DealList} />
      <Route path="/categories-list" component={CategoryList} />
      
      {/* Public deal detail route - accessible to all users */}
      <Route path="/deals/:id" component={DealDetail} />
      
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
      <Route path="/customer/secure-deals">
        <ProtectedRoute allowedRoles={['customer']}>
          <SecureDeals />
        </ProtectedRoute>
      </Route>
      <Route path="/customer/claims">
        <ProtectedRoute allowedRoles={['customer']}>
          <ClaimHistory />
        </ProtectedRoute>
      </Route>
      <Route path="/customer/wishlist">
        <ProtectedRoute allowedRoles={['customer']}>
          <CustomerWishlist />
        </ProtectedRoute>
      </Route>
      <Route path="/customer/membership-card">
        <ProtectedRoute allowedRoles={['customer']}>
          <MembershipCard />
        </ProtectedRoute>
      </Route>
      <Route path="/customer/upgrade">
        <ProtectedRoute allowedRoles={['customer']}>
          <UpgradeMembership />
        </ProtectedRoute>
      </Route>
      <Route path="/customer/deals/:id">
        <ProtectedRoute allowedRoles={['customer']}>
          <DealDetail />
        </ProtectedRoute>
      </Route>
      
      {/* Vendor routes */}
      <Route path="/vendor/benefits">
        <VendorBenefits />
      </Route>
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
      <Route path="/vendor/analytics">
        <ProtectedRoute allowedRoles={['vendor']}>
          <VendorAnalytics />
        </ProtectedRoute>
      </Route>
      
      {/* Deal Wizard */}
      <Route path="/customer/deal-wizard">
        <ProtectedRoute allowedRoles={['customer']}>
          <DealWizard />
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
      {/* TODO: Add pending routes when pages are created */}
      <Route path="/admin/deal-distribution">
        <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminDealDistribution />
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
