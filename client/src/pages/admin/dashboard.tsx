import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
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
  DollarSign,
  Download,
  FileText,
  Database
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import { useState } from "react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);

  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics"],
  });

  const { data: pendingVendors } = useQuery({
    queryKey: ["/api/admin/vendors/pending"],
  });

  const { data: pendingDeals } = useQuery({
    queryKey: ["/api/admin/deals/pending"],
  });

  // Function to handle report downloads
  const downloadReport = async (reportType: string) => {
    try {
      setDownloadingReport(reportType);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to download reports",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/admin/reports/${reportType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download ${reportType} report`);
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
        : `${reportType}-report.csv`;

      // Convert response to blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded successfully`,
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download Failed",
        description: `Failed to download ${reportType} report. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setDownloadingReport(null);
    }
  };

  if (!user) return null;

  const analyticsData = analytics as any;
  const pendingVendorsData = pendingVendors as any;
  const pendingDealsData = pendingDeals as any;

  const stats = [
    {
      title: "Total Users",
      value: analyticsData?.totalUsers?.toLocaleString() || "0",
      change: "+12%",
      changeType: "increase",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Vendors",
      value: analyticsData?.totalVendors?.toLocaleString() || "0",
      change: "+8%",
      changeType: "increase",
      icon: Store,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Total Deals",
      value: analyticsData?.totalDeals?.toLocaleString() || "0",
      change: "+15%",
      changeType: "increase",
      icon: Ticket,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Revenue",
      value: `₹${(analyticsData?.revenueEstimate || 0).toLocaleString('en-IN')}`,
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
  const cityChartData = analyticsData?.cityStats?.map((city: any) => ({
    name: city.city,
    deals: city.dealCount,
    users: city.userCount,
  })) || [
    { name: 'Mumbai', deals: 120, users: 450 },
    { name: 'Delhi', deals: 95, users: 380 },
    { name: 'Bangalore', deals: 85, users: 320 },
    { name: 'Chennai', deals: 70, users: 280 },
    { name: 'Hyderabad', deals: 60, users: 240 },
    { name: 'Pune', deals: 55, users: 200 }
  ];

  const categoryChartData = analyticsData?.categoryStats?.map((category: any) => ({
    name: category.category,
    deals: category.dealCount,
    claims: category.claimCount,
  })) || [
    { name: 'Fashion', deals: 45, claims: 38 },
    { name: 'Electronics', deals: 32, claims: 28 },
    { name: 'Food', deals: 28, claims: 25 },
    { name: 'Beauty', deals: 22, claims: 18 },
    { name: 'Home', deals: 18, claims: 15 },
    { name: 'Health', deals: 15, claims: 12 }
  ];

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
      color: "hsl(var(--chart-1))",
    },
    deals: {
      label: "Deals",
      color: "hsl(var(--chart-2))",
    },
    claims: {
      label: "Claims",
      color: "hsl(var(--chart-3))",
    },
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-4))",
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
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const gradientClass = index === 0 ? 'stat-card-primary' : 
                                 index === 1 ? 'stat-card-success' : 
                                 index === 2 ? 'stat-card-warning' : 'stat-card-danger';
            return (
              <div key={stat.title} className={`stat-card ${gradientClass} rounded-xl p-6 shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-white/90 mr-1" />
                      <span className="text-white/90 text-sm">{stat.change} from last month</span>
                    </div>
                  </div>
                  <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Growth Trends */}
          <div className="glass-card">
            <div className="p-6 border-b border-gray-200/50">
              <h3 className="text-lg font-semibold gradient-text flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Monthly Growth Trends
              </h3>
            </div>
            <div className="p-6">
              <ChartContainer config={chartConfig} className="min-h-[300px]">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.3)" />
                  <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--chart-1))" strokeWidth={3} dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="deals" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ChartContainer>
            </div>
          </div>

          {/* City Performance Chart */}
          <div className="glass-card">
            <div className="p-6 border-b border-gray-200/50">
              <h3 className="text-lg font-semibold gradient-text flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Top Cities Performance
              </h3>
            </div>
            <div className="p-6">
              <ChartContainer config={chartConfig} className="min-h-[300px]">
                <BarChart data={cityChartData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.3)" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="deals" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="users" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Category Performance */}
          <div className="glass-card">
            <div className="p-6 border-b border-gray-200/50">
              <h3 className="text-lg font-semibold gradient-text flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
                Category Performance
              </h3>
            </div>
            <div className="p-6">
              <ChartContainer config={chartConfig} className="min-h-[300px]">
                <AreaChart data={categoryChartData.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.3)" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area type="monotone" dataKey="deals" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="claims" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.8} />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>

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
                <Link to="/admin/vendors">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pendingVendorsData && pendingVendorsData.length > 0 ? (
                <div className="space-y-4">
                  {pendingVendorsData.slice(0, 3).map((vendor: any) => (
                    <div key={vendor.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{vendor.businessName}</p>
                        <p className="text-sm text-gray-500">{vendor.city}, {vendor.state}</p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  ))}
                  {pendingVendorsData.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{pendingVendorsData.length - 3} more pending approvals
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
                <Link to="/admin/deals">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pendingDealsData && pendingDealsData.length > 0 ? (
                <div className="space-y-4">
                  {pendingDealsData.slice(0, 3).map((deal: any) => (
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
                  {pendingDealsData.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{pendingDealsData.length - 3} more pending approvals
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

        {/* Reports Section */}
        <div className="mt-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gradient-text">
                <Database className="h-5 w-5 mr-2 text-blue-600" />
                Data Reports & Analytics
              </CardTitle>
              <p className="text-sm text-gray-600">
                Download comprehensive CSV reports for analysis and record-keeping. All reports include the latest data.
              </p>
            </CardHeader>
            <CardContent>
              {/* Report Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6 text-xs text-gray-500">
                <div className="text-center">
                  <span className="font-semibold text-blue-600">Users Report</span>
                  <p>All user data, memberships, savings</p>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-green-600">Vendors Report</span>
                  <p>Business profiles, approval status</p>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-orange-600">Deals Report</span>
                  <p>All deals, discounts, vendors</p>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-purple-600">Analytics Report</span>
                  <p>Platform statistics, KPIs</p>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-red-600">Claims Report</span>
                  <p>Deal redemptions, savings data</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Users Report */}
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2"
                  onClick={() => downloadReport('users')}
                  disabled={downloadingReport === 'users'}
                >
                  {downloadingReport === 'users' ? (
                    <Download className="h-6 w-6 text-blue-600 animate-bounce" />
                  ) : (
                    <Users className="h-6 w-6 text-blue-600" />
                  )}
                  <span className="text-sm">
                    {downloadingReport === 'users' ? 'Downloading...' : 'Users Report'}
                  </span>
                </Button>

                {/* Vendors Report */}
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2"
                  onClick={() => downloadReport('vendors')}
                  disabled={downloadingReport === 'vendors'}
                >
                  {downloadingReport === 'vendors' ? (
                    <Download className="h-6 w-6 text-green-600 animate-bounce" />
                  ) : (
                    <Store className="h-6 w-6 text-green-600" />
                  )}
                  <span className="text-sm">
                    {downloadingReport === 'vendors' ? 'Downloading...' : 'Vendors Report'}
                  </span>
                </Button>

                {/* Deals Report */}
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2"
                  onClick={() => downloadReport('deals')}
                  disabled={downloadingReport === 'deals'}
                >
                  {downloadingReport === 'deals' ? (
                    <Download className="h-6 w-6 text-orange-600 animate-bounce" />
                  ) : (
                    <Ticket className="h-6 w-6 text-orange-600" />
                  )}
                  <span className="text-sm">
                    {downloadingReport === 'deals' ? 'Downloading...' : 'Deals Report'}
                  </span>
                </Button>

                {/* Analytics Report */}
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2"
                  onClick={() => downloadReport('analytics')}
                  disabled={downloadingReport === 'analytics'}
                >
                  {downloadingReport === 'analytics' ? (
                    <Download className="h-6 w-6 text-purple-600 animate-bounce" />
                  ) : (
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  )}
                  <span className="text-sm">
                    {downloadingReport === 'analytics' ? 'Downloading...' : 'Analytics Report'}
                  </span>
                </Button>

                {/* Claims Report */}
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2"
                  onClick={() => downloadReport('claims')}
                  disabled={downloadingReport === 'claims'}
                >
                  {downloadingReport === 'claims' ? (
                    <Download className="h-6 w-6 text-red-600 animate-bounce" />
                  ) : (
                    <FileText className="h-6 w-6 text-red-600" />
                  )}
                  <span className="text-sm">
                    {downloadingReport === 'claims' ? 'Downloading...' : 'Claims Report'}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}