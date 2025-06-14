import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { 
  Store, 
  TrendingUp, 
  Eye, 
  Star, 
  Plus,
  BarChart3,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from "lucide-react";

export default function VendorDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: vendor } = useQuery({
    queryKey: ["/api/vendors/me"],
  });

  const { data: deals } = useQuery({
    queryKey: ["/api/vendors/deals"],
  });

  if (!user) return null;

  const isApproved = vendor?.isApproved;
  const totalDeals = deals?.length || 0;
  const activeDeals = deals?.filter((deal: any) => deal.isActive && deal.isApproved).length || 0;
  const pendingDeals = deals?.filter((deal: any) => !deal.isApproved).length || 0;
  const totalRedemptions = deals?.reduce((sum: number, deal: any) => sum + (deal.currentRedemptions || 0), 0) || 0;
  const totalViews = deals?.reduce((sum: number, deal: any) => sum + (deal.viewCount || 0), 0) || 0;

  const stats = [
    {
      title: "Active Deals",
      value: activeDeals,
      icon: Store,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Redemptions",
      value: totalRedemptions,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Total Views",
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Rating",
      value: vendor?.rating ? `${vendor.rating}/5` : "N/A",
      icon: Star,
      color: "text-royal",
      bgColor: "bg-royal/10",
    },
  ];

  const recentDeals = deals?.slice(0, 5) || [];

  const getDealStatusBadge = (deal: any) => {
    if (!deal.isApproved) {
      return <Badge variant="secondary">Pending Approval</Badge>;
    }
    if (!deal.isActive) {
      return <Badge variant="outline">Inactive</Badge>;
    }
    if (new Date(deal.validUntil) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge className="bg-success text-white">Active</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {vendor ? `Welcome, ${vendor.businessName}!` : 'Vendor Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your deals and track your business performance
          </p>
        </div>

        {/* Approval Status */}
        {vendor && !isApproved && (
          <Card className="mb-8 border-warning bg-warning/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-warning" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Account Under Review</h3>
                    <p className="text-gray-600">
                      Your vendor account is currently being reviewed. You'll be able to create deals once approved.
                    </p>
                  </div>
                </div>
                <AlertCircle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration Prompt */}
        {!vendor && (
          <Card className="mb-8 border-primary bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Store className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Complete Your Registration</h3>
                    <p className="text-gray-600">
                      Register your business to start offering deals to customers
                    </p>
                  </div>
                </div>
                <Button asChild>
                  <Link href="/vendor/register">
                    Register Now
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        {vendor && isApproved && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`${stat.bgColor} p-3 rounded-lg`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Business Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  Business Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vendor ? (
                  <div className="space-y-4">
                    {vendor.logoUrl && (
                      <img 
                        src={vendor.logoUrl} 
                        alt={vendor.businessName}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">{vendor.businessName}</h3>
                      {vendor.description && (
                        <p className="text-gray-600 text-sm mt-1">{vendor.description}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location:</span>
                        <span className="text-gray-900">{vendor.city}, {vendor.state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <Badge className={isApproved ? "bg-success text-white" : "bg-warning text-white"}>
                          {isApproved ? "Approved" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Rating:</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-gray-900">{vendor.rating || "0.0"}</span>
                        </div>
                      </div>
                      {vendor.gstNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">GST:</span>
                          <span className="text-gray-900 font-mono text-xs">{vendor.gstNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No business profile found</p>
                    <Button asChild>
                      <Link href="/vendor/register">Complete Registration</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {vendor && isApproved && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href="/vendor/deals">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Deal
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/vendor/deals")}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Deals Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Deals</CardTitle>
                {vendor && isApproved && (
                  <Button asChild>
                    <Link href="/vendor/deals">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Deal
                    </Link>
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {recentDeals.length > 0 ? (
                  <div className="space-y-4">
                    {recentDeals.map((deal: any) => (
                      <div key={deal.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{deal.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{deal.description}</p>
                          </div>
                          {getDealStatusBadge(deal)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Discount:</span>
                            <p className="font-medium text-gray-900">{deal.discountPercentage}%</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Views:</span>
                            <p className="font-medium text-gray-900">{deal.viewCount || 0}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Claims:</span>
                            <p className="font-medium text-gray-900">
                              {deal.currentRedemptions || 0}
                              {deal.maxRedemptions && `/${deal.maxRedemptions}`}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Valid Until:</span>
                            <p className="font-medium text-gray-900">
                              {new Date(deal.validUntil).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                        
                        {deal.maxRedemptions && (
                          <div className="mt-3">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Redemption Progress</span>
                              <span>{deal.currentRedemptions || 0}/{deal.maxRedemptions}</span>
                            </div>
                            <Progress 
                              value={((deal.currentRedemptions || 0) / deal.maxRedemptions) * 100} 
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="text-center pt-4">
                      <Button variant="outline" asChild>
                        <Link href="/vendor/deals">View All Deals</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    {vendor && isApproved ? (
                      <>
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No deals created yet</h3>
                        <p className="text-gray-600 mb-4">Start creating deals to attract customers</p>
                        <Button asChild>
                          <Link href="/vendor/deals">Create Your First Deal</Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {vendor ? "Awaiting Approval" : "Registration Required"}
                        </h3>
                        <p className="text-gray-600">
                          {vendor 
                            ? "Complete your registration and get approved to start creating deals"
                            : "Register your business to start offering deals"
                          }
                        </p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Insights */}
            {vendor && isApproved && totalDeals > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Deal Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Conversion Rate</span>
                          <span className="font-medium">
                            {totalViews > 0 ? ((totalRedemptions / totalViews) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Avg. Views per Deal</span>
                          <span className="font-medium">
                            {totalDeals > 0 ? Math.round(totalViews / totalDeals) : 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Pending Approvals</span>
                          <span className="font-medium">{pendingDeals}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Quick Tips</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span>Add compelling images to increase views</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span>Set competitive discount percentages</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span>Update deals regularly for better engagement</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
