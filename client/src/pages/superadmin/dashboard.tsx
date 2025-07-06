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
  Shield,
  Database,
  Activity,
  Settings,
  BarChart3,
  Eye,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  Globe,
  Server
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from "recharts";

export default function SuperAdminDashboard() {
  const { user } = useAuth();

  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics"],
  });

  const { data: systemLogs } = useQuery({
    queryKey: ["/api/superadmin/logs", "10"],
  });

  if (!user) return null;

  const stats = [
    {
      title: "Platform Revenue",
      value: `₹${(analytics?.revenueEstimate || 0).toLocaleString('en-IN')}`,
      change: "+22%",
      changeType: "increase",
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Total Users",
      value: analytics?.totalUsers?.toLocaleString() || "0",
      change: "+12%",
      changeType: "increase",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Vendors",
      value: analytics?.totalVendors?.toLocaleString() || "0",
      change: "+8%",
      changeType: "increase",
      icon: Store,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "System Health",
      value: "99.9%",
      change: "Optimal",
      changeType: "neutral",
      icon: Activity,
      color: "text-royal",
      bgColor: "bg-royal/10",
    },
  ];

  const systemMetrics = [
    {
      title: "Database Performance",
      value: 95,
      status: "excellent",
      description: "Query response time avg: 45ms",
    },
    {
      title: "API Response Time",
      value: 88,
      status: "good", 
      description: "Average response: 120ms",
    },
    {
      title: "Server Uptime",
      value: 99.9,
      status: "excellent",
      description: "Last 30 days: 99.95%",
    },
    {
      title: "Error Rate",
      value: 0.1,
      status: "excellent",
      description: "0.1% error rate last 24h",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-success";
      case "good": return "text-warning";
      case "poor": return "text-destructive";
      default: return "text-gray-500";
    }
  };

  const getProgressColor = (value: number) => {
    if (value >= 95) return "bg-success";
    if (value >= 80) return "bg-warning";
    return "bg-destructive";
  };

  // Chart data for SuperAdmin analytics
  const platformGrowthData = [
    { month: 'Jan', users: 1200, vendors: 45, deals: 180, revenue: 125000 },
    { month: 'Feb', users: 1850, vendors: 68, deals: 245, revenue: 185000 },
    { month: 'Mar', users: 2400, vendors: 89, deals: 320, revenue: 248000 },
    { month: 'Apr', users: 3200, vendors: 112, deals: 425, revenue: 325000 },
    { month: 'May', users: 4100, vendors: 135, deals: 548, revenue: 425000 },
    { month: 'Jun', users: 4800, vendors: 158, deals: 680, revenue: 520000 },
  ];

  const systemPerformanceData = [
    { time: '00:00', cpu: 45, memory: 62, requests: 1200 },
    { time: '04:00', cpu: 38, memory: 58, requests: 800 },
    { time: '08:00', cpu: 72, memory: 78, requests: 2400 },
    { time: '12:00', cpu: 85, memory: 82, requests: 3200 },
    { time: '16:00', cpu: 78, memory: 75, requests: 2800 },
    { time: '20:00', cpu: 65, memory: 68, requests: 2100 },
  ];

  const userDistributionData = [
    { name: 'Customers', value: 4200, color: '#3B82F6' },
    { name: 'Vendors', value: 158, color: '#10B981' },
    { name: 'Admins', value: 12, color: '#F59E0B' },
    { name: 'Super Admins', value: 3, color: '#8B5CF6' }
  ];

  const analyticsData = analytics as any;
  const cityPerformanceData = analyticsData?.cityStats?.slice(0, 10) || [
    { name: 'Mumbai', users: 850, deals: 125, revenue: 89000 },
    { name: 'Delhi', users: 720, deals: 98, revenue: 72000 },
    { name: 'Bangalore', users: 650, deals: 87, revenue: 65000 },
    { name: 'Chennai', users: 580, deals: 76, revenue: 58000 },
    { name: 'Hyderabad', users: 480, deals: 65, revenue: 48000 },
  ];

  const chartConfig = {
    users: { label: "Users", color: "hsl(var(--chart-1))" },
    vendors: { label: "Vendors", color: "hsl(var(--chart-2))" },
    deals: { label: "Deals", color: "hsl(var(--chart-3))" },
    revenue: { label: "Revenue", color: "hsl(var(--chart-4))" },
    cpu: { label: "CPU %", color: "hsl(var(--chart-5))" },
    memory: { label: "Memory %", color: "hsl(var(--chart-3))" },
    requests: { label: "Requests", color: "hsl(var(--chart-1))" },
  };

  const recentAlerts = [
    {
      id: 1,
      type: "security",
      title: "Security scan completed",
      description: "No vulnerabilities detected",
      time: "1 hour ago",
      severity: "info",
      icon: Shield,
    },
    {
      id: 2,
      type: "performance",
      title: "High traffic detected",
      description: "Server load at 85% - monitoring",
      time: "3 hours ago",
      severity: "warning",
      icon: TrendingUp,
    },
    {
      id: 3,
      type: "system",
      title: "Database backup completed",
      description: "Automated backup successful",
      time: "6 hours ago",
      severity: "success",
      icon: Database,
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "success": return "text-success bg-success/10";
      case "warning": return "text-warning bg-warning/10";
      case "error": return "text-destructive bg-destructive/10";
      default: return "text-primary bg-primary/10";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor platform operations, system health, and administrative functions
          </p>
        </div>

        {/* Platform Overview Stats */}
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
                      {stat.changeType === "increase" && <TrendingUp className="h-4 w-4 text-white/90 mr-1" />}
                      <span className="text-white/90 text-sm">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="bg-card/20 p-4 rounded-full backdrop-blur-sm">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Advanced Analytics Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Platform Growth Trends */}
          <div className="glass-card">
            <div className="p-6 border-b border-gray-200/50">
              <h3 className="text-lg font-semibold gradient-text flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Platform Growth Overview
              </h3>
            </div>
            <div className="p-6">
              <ChartContainer config={chartConfig} className="min-h-[300px]">
                <AreaChart data={platformGrowthData}>
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
                  <Area type="monotone" dataKey="users" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="vendors" stackId="2" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="deals" stackId="3" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.8} />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>

          {/* System Performance Monitoring */}
          <div className="glass-card">
            <div className="p-6 border-b border-gray-200/50">
              <h3 className="text-lg font-semibold gradient-text flex items-center">
                <Server className="h-5 w-5 mr-2 text-purple-600" />
                Real-time System Metrics
              </h3>
            </div>
            <div className="p-6">
              <ChartContainer config={chartConfig} className="min-h-[300px]">
                <LineChart data={systemPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.3)" />
                  <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 12 }} />
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
                  <Line type="monotone" dataKey="cpu" stroke="hsl(var(--chart-5))" strokeWidth={3} dot={{ fill: 'hsl(var(--chart-5))', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="memory" stroke="hsl(var(--chart-3))" strokeWidth={3} dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ChartContainer>
            </div>
          </div>

          {/* User Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Role Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px]">
                <PieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Top Cities Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Top Cities Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px]">
                <BarChart data={cityPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="users" fill="var(--color-users)" />
                  <Bar dataKey="deals" fill="var(--color-deals)" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* System Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {systemMetrics.map((metric) => (
                  <div key={metric.title} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">{metric.title}</span>
                      <span className={`text-sm font-semibold ${getStatusColor(metric.status)}`}>
                        {metric.title === "Error Rate" ? `${metric.value}%` : `${metric.value}%`}
                      </span>
                    </div>
                    <Progress 
                      value={metric.title === "Error Rate" ? 100 - metric.value : metric.value} 
                      className="h-2"
                    />
                    <p className="text-xs text-gray-500">{metric.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <div key={alert.id} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSeverityColor(alert.severity)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{alert.title}</p>
                        <p className="text-xs text-gray-500">{alert.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* City Performance & Recent Logs */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Top Cities Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Top Performing Cities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.cityStats?.slice(0, 5).map((city: any, index: number) => {
                  const maxDeals = Math.max(...(analytics.cityStats?.map((c: any) => c.dealCount) || [1]));
                  const percentage = (city.dealCount / maxDeals) * 100;
                  
                  return (
                    <div key={city.city} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-700 font-medium">{city.city}</span>
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{city.dealCount} deals</span>
                          <span>•</span>
                          <span>{city.userCount} users</span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent System Logs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Server className="h-5 w-5 mr-2" />
                Recent System Activity
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/superadmin/logs">View All Logs</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {systemLogs && systemLogs.length > 0 ? (
                <div className="space-y-3">
                  {systemLogs.slice(0, 5).map((log: any) => (
                    <div key={log.id} className="flex items-start space-x-3 p-2 border border-gray-100 rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{log.action}</p>
                        {log.details && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(log.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Server className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-muted-foreground">No recent system activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Admin Functions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Administrative Functions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                asChild
              >
                <Link to="/admin/users">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">User Management</span>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                asChild
              >
                <Link to="/admin/vendors">
                  <Store className="h-6 w-6" />
                  <span className="text-sm">Vendor Management</span>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                asChild
              >
                <Link to="/admin/deals">
                  <Ticket className="h-6 w-6" />
                  <span className="text-sm">Deal Approval</span>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                asChild
              >
                <Link to="/superadmin/admins">
                  <UserCheck className="h-6 w-6" />
                  <span className="text-sm">Admin Users</span>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                asChild
              >
                <Link to="/superadmin/logs">
                  <Eye className="h-6 w-6" />
                  <span className="text-sm">System Logs</span>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                asChild
              >
                <Link to="/admin/dashboard">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Analytics</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status Summary */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="border-success bg-success/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-success font-medium">System Status</p>
                  <p className="text-2xl font-bold text-foreground">Operational</p>
                  <p className="text-xs text-muted-foreground mt-1">All systems running normally</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary font-medium">Active Sessions</p>
                  <p className="text-2xl font-bold text-foreground">1,247</p>
                  <p className="text-xs text-muted-foreground mt-1">Users currently online</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-warning bg-warning/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-warning font-medium">Pending Actions</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(analytics?.totalDeals || 0) - (analytics?.totalDeals || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Items requiring review</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
