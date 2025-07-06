import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Server, 
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  Eye,
  Download,
  Calendar,
  Clock,
  User,
  Globe,
  Smartphone,
  RefreshCw
} from "lucide-react";

export default function SystemLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("24h");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["/api/superadmin/logs", timeFilter === "24h" ? "100" : "500"],
  });

  // Filter logs based on search and filters
  const filteredLogs = logs?.filter((log: any) => {
    const matchesSearch = searchQuery === "" || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesAction = actionFilter === "all" || log.action.includes(actionFilter.toUpperCase());
    
    const now = new Date();
    const logDate = new Date(log.createdAt);
    const timeDiff = now.getTime() - logDate.getTime();
    
    let matchesTime = true;
    if (timeFilter === "1h") {
      matchesTime = timeDiff <= 1000 * 60 * 60; // 1 hour
    } else if (timeFilter === "24h") {
      matchesTime = timeDiff <= 1000 * 60 * 60 * 24; // 24 hours
    } else if (timeFilter === "7d") {
      matchesTime = timeDiff <= 1000 * 60 * 60 * 24 * 7; // 7 days
    }
    
    return matchesSearch && matchesAction && matchesTime;
  }) || [];

  const getActionBadge = (action: string) => {
    if (action.includes("LOGIN") || action.includes("SIGNUP")) {
      return <Badge className="bg-primary/10 text-primary">Authentication</Badge>;
    }
    if (action.includes("APPROVED") || action.includes("CREATED")) {
      return <Badge className="bg-success/10 text-success">Success</Badge>;
    }
    if (action.includes("ERROR") || action.includes("FAILED")) {
      return <Badge className="bg-destructive/10 text-destructive">Error</Badge>;
    }
    if (action.includes("UPDATE") || action.includes("MODIFIED")) {
      return <Badge className="bg-warning/10 text-warning">Update</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-700">System</Badge>;
  };

  const getActionIcon = (action: string) => {
    if (action.includes("ERROR") || action.includes("FAILED")) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    if (action.includes("APPROVED") || action.includes("SUCCESS")) {
      return <CheckCircle className="h-4 w-4 text-success" />;
    }
    return <Info className="h-4 w-4 text-primary" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDetails = (details: any) => {
    if (!details) return "No additional details";
    if (typeof details === 'string') return details;
    return JSON.stringify(details, null, 2);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const logDate = new Date(dateString);
    const diffMs = now.getTime() - logDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Calculate summary stats
  const totalLogs = filteredLogs.length;
  const errorLogs = filteredLogs.filter(log => log.action.includes("ERROR") || log.action.includes("FAILED")).length;
  const authLogs = filteredLogs.filter(log => log.action.includes("LOGIN") || log.action.includes("SIGNUP")).length;
  const systemLogs = filteredLogs.filter(log => 
    log.action.includes("APPROVED") || log.action.includes("CREATED") || log.action.includes("UPDATE")
  ).length;

  const stats = [
    { label: "Total Logs", value: totalLogs, icon: Server, color: "text-primary" },
    { label: "System Events", value: systemLogs, icon: Activity, color: "text-success" },
    { label: "Auth Events", value: authLogs, icon: User, color: "text-warning" },
    { label: "Errors", value: errorLogs, icon: AlertCircle, color: "text-destructive" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Logs</h1>
            <p className="text-muted-foreground mt-1">
              Monitor system activity and audit trails
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="login">Authentication</SelectItem>
                  <SelectItem value="approved">Approvals</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="error">Errors</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setActionFilter("all");
                  setTimeFilter("24h");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>System Activity Logs ({filteredLogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading system logs...</p>
              </div>
            ) : filteredLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {getActionIcon(log.action)}
                            <div>
                              <p className="font-medium text-foreground">{log.action.replace(/_/g, ' ')}</p>
                              {getActionBadge(log.action)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-foreground">
                              {log.userId ? `User #${log.userId}` : "System"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm text-foreground line-clamp-2">
                              {log.details ? (
                                typeof log.details === 'object' 
                                  ? Object.entries(log.details).map(([key, value]) => 
                                      `${key}: ${value}`).join(', ').substring(0, 100) + '...'
                                  : log.details.toString().substring(0, 100) + (log.details.length > 100 ? '...' : '')
                              ) : "No details"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 text-sm">
                            <Globe className="h-3 w-3 text-gray-400" />
                            <span className="font-mono text-muted-foreground">
                              {log.ipAddress || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="text-foreground">{getTimeAgo(log.createdAt)}</p>
                            <p className="text-xs text-gray-500">{formatDate(log.createdAt)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedLog(log)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Log Details - {log.action.replace(/_/g, ' ')}</DialogTitle>
                              </DialogHeader>
                              
                              {selectedLog && (
                                <div className="space-y-6">
                                  {/* Basic Info */}
                                  <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="font-medium text-foreground mb-3">Event Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Action:</span>
                                          <span className="text-foreground font-medium">{selectedLog.action.replace(/_/g, ' ')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Timestamp:</span>
                                          <span className="text-foreground">{formatDate(selectedLog.createdAt)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">User ID:</span>
                                          <span className="text-foreground">{selectedLog.userId || "System"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Type:</span>
                                          {getActionBadge(selectedLog.action)}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium text-foreground mb-3">Request Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">IP Address:</span>
                                          <span className="text-foreground font-mono">{selectedLog.ipAddress || "Unknown"}</span>
                                        </div>
                                        {selectedLog.userAgent && (
                                          <div>
                                            <span className="text-gray-500">User Agent:</span>
                                            <p className="text-foreground text-xs mt-1 break-all">
                                              {selectedLog.userAgent}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Event Details */}
                                  {selectedLog.details && (
                                    <div>
                                      <h4 className="font-medium text-foreground mb-3">Event Details</h4>
                                      <div className="bg-gray-50 rounded-lg p-4">
                                        <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                                          {formatDetails(selectedLog.details)}
                                        </pre>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Device Info */}
                                  {selectedLog.userAgent && (
                                    <div>
                                      <h4 className="font-medium text-foreground mb-3">Device Information</h4>
                                      <div className="flex items-center space-x-4 text-sm">
                                        <div className="flex items-center space-x-2">
                                          <Smartphone className="h-4 w-4 text-gray-400" />
                                          <span className="text-muted-foreground">
                                            {selectedLog.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Globe className="h-4 w-4 text-gray-400" />
                                          <span className="text-muted-foreground">
                                            {selectedLog.userAgent.includes('Chrome') ? 'Chrome' :
                                             selectedLog.userAgent.includes('Firefox') ? 'Firefox' :
                                             selectedLog.userAgent.includes('Safari') ? 'Safari' : 'Unknown Browser'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No logs found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || actionFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "No system activity in the selected time period"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Log Retention Policy */}
        <Card className="mt-8 border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Info className="h-5 w-5 mr-2" />
              Log Retention Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-foreground mb-2">Retention Periods:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Authentication logs: 90 days</li>
                  <li>• System events: 180 days</li>
                  <li>• Error logs: 365 days</li>
                  <li>• Admin actions: 2 years</li>
                  <li>• Security events: Indefinite</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Data Processing:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Logs are encrypted at rest</li>
                  <li>• Personal data is anonymized</li>
                  <li>• Regular automated backups</li>
                  <li>• Compliance with data protection laws</li>
                  <li>• Access is logged and monitored</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
