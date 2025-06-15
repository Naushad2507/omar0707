import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { 
  Users, 
  Store, 
  Ticket, 
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Eye,
  DollarSign
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics"],
  });

  const { data: pendingVendors } = useQuery({
    queryKey: ["/api/admin/vendors/pending"],
  });

  const { data: pendingDeals } = useQuery({
    queryKey: ["/api/admin/deals/pending"],
  });

  if (!user) return null;

  const stats = [
    {
      title: "Total Users",
      value: (analytics as any)?.totalUsers?.toLocaleString() || "0",
      change: "+12%",
      changeType: "increase",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Vendors",
      value: (analytics as any)?.totalVendors?.toLocaleString() || "0",
      change: "+8%",
      changeType: "increase",
      icon: Store,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Total Deals",
      value: (analytics as any)?.totalDeals?.toLocaleString() || "0",
      change: "+15%",
      changeType: "increase",
      icon: Ticket,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Revenue",
      value: `₹${((analytics as any)?.revenueEstimate || 0).toLocaleString('en-IN')}`,
      change: "+22%",
      changeType: "increase",
      icon: DollarSign,
      color: "text-royal",
      bgColor: "bg-royal/10",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "deal_approved",
      title: "Deal approved",
      description: "Fashion Hub submitted new winter sale",
      time: "2 hours ago",
      icon: CheckCircle,
      iconColor: "text-success",
    },
    {
      id: 2,
      type: "vendor_registered",
      title: "New vendor registered",
      description: "TechZone Electronics from Mumbai",
      time: "4 hours ago",
      icon: Store,
      iconColor: "text-primary",
    },
    {
      id: 3,
      type: "help_ticket",
      title: "Help ticket submitted",
      description: "User reported payment issue",
      time: "6 hours ago",
      icon: AlertCircle,
      iconColor: "text-warning",
    },
  ];

  // Chart data based on analytics
  const cityChartData = (analytics as any)?.cityStats?.map((city: any) => ({
    name: city.city,
    deals: city.dealCount,
    users: city.userCount,
  })) || [];

  const categoryChartData = (analytics as any)?.categoryStats?.map((category: any) => ({
    name: category.category,
    deals: category.dealCount,
    claims: category.claimCount,
  })) || [];

  const monthlyTrendData = [
    { month: 'Jan', users: 1200, deals: 450, revenue: 25000 },
    { month: 'Feb', users: 1800, deals: 620, revenue: 35000 },
    { month: 'Mar', users: 2400, deals: 780, revenue: 48000 },
    { month: 'Apr', users: 3200, deals: 920, revenue: 62000 },
    { month: 'May', users: 4100, deals: 1150, revenue: 78000 },
    { month: 'Jun', users: 4800, deals: 1380, revenue: 92000 },
  ];

  const chartConfig = {
    users: {
      label: "Users",
      color: "hsl(var(--primary))",
    },
    deals: {
      label: "Deals",
      color: "hsl(var(--success))",
    },
    claims: {
      label: "Claims",
      color: "hsl(var(--warning))",
    },
    revenue: {
      label: "Revenue",
      color: "hsl(var(--royal))",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor platform performance and manage operations
          </p>
        </div>

        {/* Overview Stats */}
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
                      <div className="flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 text-success mr-1" />
                        <span className="text-xs text-success">{stat.change} from last month</span>
                      </div>
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

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Growth Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Monthly Growth Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px]">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} />
                  <Line type="monotone" dataKey="deals" stroke="var(--color-deals)" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* City Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Top Cities Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px]">
                <BarChart data={cityChartData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="deals" fill="var(--color-deals)" />
                  <Bar dataKey="users" fill="var(--color-users)" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Category Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px]">
                <AreaChart data={categoryChartData.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area type="monotone" dataKey="deals" stackId="1" stroke="var(--color-deals)" fill="var(--color-deals)" />
                  <Area type="monotone" dataKey="claims" stackId="1" stroke="var(--color-claims)" fill="var(--color-claims)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.iconColor === 'text-success' ? 'bg-success/10' : activity.iconColor === 'text-primary' ? 'bg-primary/10' : 'bg-warning/10'}`}>
                        <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Pending Vendors */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pending Vendor Approvals</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/vendors">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pendingVendors && (pendingVendors as any).length > 0 ? (
                <div className="space-y-4">
                  {(pendingVendors as any).slice(0, 3).map((vendor: any) => (
                    <div key={vendor.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{vendor.businessName}</p>
                        <p className="text-sm text-gray-500">{vendor.city}, {vendor.state}</p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  ))}
                  {pendingVendors.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{pendingVendors.length - 3} more pending approvals
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No pending vendor approvals</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Deals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pending Deal Approvals</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/deals">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pendingDeals && pendingDeals.length > 0 ? (
                <div className="space-y-4">
                  {pendingDeals.slice(0, 3).map((deal: any) => (
                    <div key={deal.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{deal.title}</p>
                        <p className="text-sm text-gray-500">
                          By {deal.vendor?.businessName} - {deal.discountPercentage}% off
                        </p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  ))}
                  {pendingDeals.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{pendingDeals.length - 3} more pending approvals
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No pending deal approvals</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Category Performance */}
        {analytics?.categoryStats && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Category Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {analytics.categoryStats.slice(0, 6).map((category: any) => (
                  <div key={category.category} className="text-center">
                    <h4 className="font-medium text-gray-900 capitalize mb-2">{category.category}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Deals:</span>
                        <span className="font-medium">{category.dealCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Claims:</span>
                        <span className="font-medium">{category.claimCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Conversion:</span>
                        <span className="font-medium">
                          {category.dealCount > 0 ? ((category.claimCount / category.dealCount) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Button className="h-20 flex flex-col items-center justify-center space-y-2" asChild>
                <Link href="/admin/vendors">
                  <Store className="h-6 w-6" />
                  <span>Manage Vendors</span>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2" asChild>
                <Link href="/admin/deals">
                  <Ticket className="h-6 w-6" />
                  <span>Review Deals</span>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2" asChild>
                <Link href="/admin/users">
                  <Users className="h-6 w-6" />
                  <span>User Management</span>
                </Link>
              </Button>
              
              {user.role === "superadmin" && (
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2" asChild>
                  <Link href="/superadmin/logs">
                    <Eye className="h-6 w-6" />
                    <span>System Logs</span>
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
