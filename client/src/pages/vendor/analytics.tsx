import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Target, 
  Clock, 
  DollarSign,
  ArrowLeft,
  Calendar,
  Users,
  Star
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

export default function VendorAnalytics() {
  const { user } = useAuth();

  // Fetch deals data
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["/api/vendors/deals"],
  });

  const dealsArray = Array.isArray(deals) ? deals : [];

  // Calculate analytics data
  const totalDeals = dealsArray.length;
  const activeDeals = dealsArray.filter((deal: any) => deal.status === 'active').length;
  const pendingDeals = dealsArray.filter((deal: any) => deal.status === 'pending').length;
  const totalViews = dealsArray.reduce((sum: number, deal: any) => sum + (deal.views || 0), 0);
  const totalClaims = dealsArray.reduce((sum: number, deal: any) => sum + (deal.claimCount || 0), 0);
  const totalRevenue = dealsArray.reduce((sum: number, deal: any) => {
    const savings = parseFloat(deal.originalPrice || 0) - parseFloat(deal.discountedPrice || 0);
    return sum + (savings * (deal.claimCount || 0));
  }, 0);

  // Performance data for charts
  const dealPerformanceData = dealsArray.slice(0, 10).map((deal: any) => ({
    name: deal.title.substring(0, 20) + (deal.title.length > 20 ? '...' : ''),
    views: deal.views || 0,
    claims: deal.claimCount || 0,
    revenue: (parseFloat(deal.originalPrice || 0) - parseFloat(deal.discountedPrice || 0)) * (deal.claimCount || 0)
  }));

  // Category performance
  const categoryData = dealsArray.reduce((acc: any, deal: any) => {
    const category = deal.category || 'Other';
    if (!acc[category]) {
      acc[category] = { category, deals: 0, claims: 0, views: 0 };
    }
    acc[category].deals += 1;
    acc[category].claims += deal.claimCount || 0;
    acc[category].views += deal.views || 0;
    return acc;
  }, {});

  const categoryChartData = Object.values(categoryData);

  // Monthly trend data (mock data for demonstration)
  const monthlyData = [
    { month: 'Jan', deals: 5, claims: 23, revenue: 12000 },
    { month: 'Feb', deals: 8, claims: 45, revenue: 18000 },
    { month: 'Mar', deals: 12, claims: 67, revenue: 25000 },
    { month: 'Apr', deals: 15, claims: 89, revenue: 32000 },
    { month: 'May', deals: 18, claims: 112, revenue: 38000 },
    { month: 'Jun', deals: 22, claims: 134, revenue: 45000 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/vendor/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Track your deal performance and business metrics</p>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Last 30 days
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Deals</p>
                  <p className="text-2xl font-bold text-gray-900">{totalDeals}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {activeDeals} active, {pendingDeals} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Claims</p>
                  <p className="text-2xl font-bold text-gray-900">{totalClaims}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-purple-600 mt-2">+8% conversion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Est. Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-xs text-yellow-600 mt-2">+15% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Deal Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Deal Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dealPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="views" fill="#3B82F6" name="Views" />
                  <Bar dataKey="claims" fill="#10B981" name="Claims" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="deals" stroke="#3B82F6" name="Deals" />
                  <Line type="monotone" dataKey="claims" stroke="#10B981" name="Claims" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Performance */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="deals"
                  >
                    {categoryChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dealsArray.slice(0, 5).map((deal: any, index: number) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{deal.title}</p>
                      <p className="text-xs text-gray-500">{deal.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{deal.views || 0} views</p>
                      <p className="text-xs text-gray-500">{deal.claimCount || 0} claims</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}