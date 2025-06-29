import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
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
import PosDashboard from "@/pages/vendor/pos-dashboard";
import PosTransactions from "@/pages/vendor/pos-transactions";

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
import MagicAdminDashboard from "@/components/AdminDashboard";
import BannerList from "@/components/BannerList";

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
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(fallbackPath, { replace: true });
    } else if (!isLoading && user && !allowedRoles.includes(user.role)) {
      navigate("/unauthorized", { replace: true });
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, fallbackPath, navigate]);

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

      {/* Public deal browsing */}
      <Route path="/deals" element={<DealList />} />

      {/* Public deal detail route */}
      <Route path="/deals/:id" element={<DealDetail />} />

      {/* Public banner listing */}
      <Route path="/banners" element={<BannerList />} />

      {/* Customer routes with role protection */}
      <Route path="/customer" element={
        <RoleProtectedRoute allowedRoles={['customer']}>
          <DealList />
        </RoleProtectedRoute>
      } />

      <Route path="/customer/subscription" element={
        <RoleProtectedRoute allowedRoles={['customer']}>
          <SubscriptionButton />
        </RoleProtectedRoute>
      } />

      <Route path="/customer/dashboard" element={
        <RoleProtectedRoute allowedRoles={['customer']}>
          <CustomerDashboard />
        </RoleProtectedRoute>
      } />

      <Route path="/customer/deals" element={
        <RoleProtectedRoute allowedRoles={['customer']}>
          <CustomerDeals />
        </RoleProtectedRoute>
      } />

      <Route path="/customer/secure-deals" element={
        <RoleProtectedRoute allowedRoles={['customer']}>
          <SecureDeals />
        </RoleProtectedRoute>
      } />

      <Route path="/customer/claims" element={
        <RoleProtectedRoute allowedRoles={['customer']}>
          <ClaimHistory />
        </RoleProtectedRoute>
      } />

      <Route path="/customer/wishlist" element={
        <RoleProtectedRoute allowedRoles={['customer']}>
          <CustomerWishlist />
        </RoleProtectedRoute>
      } />

      <Route path="/customer/membership-card" element={
        <RoleProtectedRoute allowedRoles={['customer']}>
          <MembershipCard />
        </RoleProtectedRoute>
      } />

      <Route path="/customer/upgrade" element={
        <RoleProtectedRoute allowedRoles={['customer']}>
          <UpgradeMembership />
        </RoleProtectedRoute>
      } />

      {/* Vendor routes with role protection */}
      <Route path="/vendor" element={
        <RoleProtectedRoute allowedRoles={['vendor', 'customer']} fallbackPath="/vendor/portal">
          <VendorPortal />
        </RoleProtectedRoute>
      } />

      <Route path="/vendor/portal" element={<VendorPortal />} />

      <Route path="/vendor/benefits" element={<VendorBenefits />} />

      <Route path="/vendor/register" element={
        <RoleProtectedRoute allowedRoles={['vendor']}>
          <VendorRegister />
        </RoleProtectedRoute>
      } />

      <Route path="/vendor/dashboard" element={
        <RoleProtectedRoute allowedRoles={['vendor']}>
          <VendorDashboard />
        </RoleProtectedRoute>
      } />

      <Route path="/vendor/deals" element={
        <RoleProtectedRoute allowedRoles={['vendor']}>
          <VendorDeals />
        </RoleProtectedRoute>
      } />

      <Route path="/vendor/analytics" element={
        <RoleProtectedRoute allowedRoles={['vendor']}>
          <VendorAnalytics />
        </RoleProtectedRoute>
      } />

      <Route path="/vendor/pos" element={
        <RoleProtectedRoute allowedRoles={['vendor']}>
          <PosDashboard />
        </RoleProtectedRoute>
      } />

      <Route path="/vendor/pos/transactions" element={
        <RoleProtectedRoute allowedRoles={['vendor']}>
          <PosTransactions />
        </RoleProtectedRoute>
      } />

      {/* Admin routes with role protection */}
      <Route path="/admin" element={
        <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <MagicAdminDashboard />
        </RoleProtectedRoute>
      } />

      <Route path="/admin/magic" element={
        <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <MagicAdminDashboard />
        </RoleProtectedRoute>
      } />

      <Route path="/admin/dashboard" element={
        <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminDashboard />
        </RoleProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminUsers />
        </RoleProtectedRoute>
      } />

      <Route path="/admin/vendors" element={
        <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminVendors />
        </RoleProtectedRoute>
      } />

      <Route path="/admin/deals" element={
        <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <AdminDeals />
        </RoleProtectedRoute>
      } />

      {/* Super Admin routes with role protection */}
      <Route path="/superadmin" element={
        <RoleProtectedRoute allowedRoles={['superadmin']}>
          <SuperAdminDashboard />
        </RoleProtectedRoute>
      } />

      <Route path="/superadmin/dashboard" element={
        <RoleProtectedRoute allowedRoles={['superadmin']}>
          <SuperAdminDashboard />
        </RoleProtectedRoute>
      } />

      <Route path="/superadmin/logs" element={
        <RoleProtectedRoute allowedRoles={['superadmin']}>
          <SystemLogs />
        </RoleProtectedRoute>
      } />

      {/* Unauthorized page */}
      <Route path="/unauthorized" element={
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
      } />

      {/* Fallback to 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
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
        <BrowserRouter basename="/instoredealz">
          <Router />
          <Toaster />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;