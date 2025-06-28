import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import StoreDeals from "@/components/StoreDeals";
import BlogList from "@/components/BlogList";
import Subscription from "@/components/Subscription";

function Router() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/help" element={<Help />} />
      <Route path="/test" element={<TestFlows />} />
      
      {/* New external API routes */}
      <Route path="/deals" element={<DealList />} />
      <Route path="/categories" element={<CategoryList />} />
      <Route path="/blogs" element={<BlogList />} />
      <Route path="/store-deals" element={<StoreDeals storeId="123" dealId="456" pinId="789" />} />
      <Route path="/subscription" element={<Subscription />} />
      
      {/* Public deal detail route - accessible to all users */}
      <Route path="/deals/:id" element={<DealDetail />} />
      
      {/* Customer routes */}
      <Route path="/customer/dashboard" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <CustomerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/customer/deals" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <CustomerDeals />
        </ProtectedRoute>
      } />
      <Route path="/customer/secure-deals" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <SecureDeals />
        </ProtectedRoute>
      } />
      <Route path="/customer/claims" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <ClaimHistory />
        </ProtectedRoute>
      } />
      <Route path="/customer/wishlist" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <CustomerWishlist />
        </ProtectedRoute>
      } />
      <Route path="/customer/membership-card" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <MembershipCard />
        </ProtectedRoute>
      } />
      <Route path="/customer/upgrade" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <UpgradeMembership />
        </ProtectedRoute>
      } />
      <Route path="/customer/deals/:id" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <DealDetail />
        </ProtectedRoute>
      } />
      
      {/* Vendor routes */}
      <Route path="/vendor/benefits" element={<VendorBenefits />} />
      <Route path="/vendor/register" element={
        <ProtectedRoute allowedRoles={['vendor']}>
          <VendorRegister />
        </ProtectedRoute>
      } />
      <Route path="/vendor/dashboard" element={
        <ProtectedRoute allowedRoles={['vendor']}>
          <VendorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/vendor/deals" element={
        <ProtectedRoute allowedRoles={['vendor']}>
          <VendorDeals />
        </ProtectedRoute>
      } />
      <Route path="/vendor/analytics" element={
        <ProtectedRoute allowedRoles={['vendor']}>
          <VendorAnalytics />
        </ProtectedRoute>
      } />
      
      {/* Deal Wizard */}
      <Route path="/customer/deal-wizard" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <DealWizard />
        </ProtectedRoute>
      } />
      
      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminUsers />
        </ProtectedRoute>
      } />
      <Route path="/admin/vendors" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminVendors />
        </ProtectedRoute>
      } />
      <Route path="/admin/deals" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminDeals />
        </ProtectedRoute>
      } />
      <Route path="/admin/deal-distribution" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminDealDistribution />
        </ProtectedRoute>
      } />
      
      {/* Super Admin routes */}
      <Route path="/superadmin/dashboard" element={
        <ProtectedRoute allowedRoles={['superadmin']}>
          <SuperAdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/superadmin/admins" element={
        <ProtectedRoute allowedRoles={['superadmin']}>
          <AdminManagement />
        </ProtectedRoute>
      } />
      <Route path="/superadmin/logs" element={
        <ProtectedRoute allowedRoles={['superadmin']}>
          <SystemLogs />
        </ProtectedRoute>
      } />
      
      {/* Fallback to 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
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
        <BrowserRouter>
          <Toaster />
          <Router />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
