import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Store, 
  Ticket, 
  BarChart3,
  FileText,
  Download,
  Database,
  Calendar,
  TrendingUp,
  Activity,
  Clock
} from "lucide-react";

export default function AdminReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);

  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics"],
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

  const reportTypes = [
    {
      id: 'users',
      title: 'Users Report',
      description: 'Complete user database with membership plans, total savings, and registration details',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      fields: ['ID', 'Name', 'Email', 'Role', 'Membership Plan', 'Total Savings', 'Deals Claimed', 'Join Date'],
      count: analyticsData?.totalUsers || 0
    },
    {
      id: 'vendors',
      title: 'Vendors Report',
      description: 'Business profiles, approval status, and vendor performance metrics',
      icon: Store,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      fields: ['ID', 'Business Name', 'Contact Name', 'Email', 'Status', 'City', 'State', 'Deals Created', 'Registration Date'],
      count: analyticsData?.totalVendors || 0
    },
    {
      id: 'deals',
      title: 'Deals Report',
      description: 'All deals with vendor information, discount details, and performance data',
      icon: Ticket,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      fields: ['ID', 'Title', 'Category', 'Discount %', 'Vendor', 'City', 'Status', 'Claims', 'Valid Until', 'Created Date'],
      count: analyticsData?.totalDeals || 0
    },
    {
      id: 'analytics',
      title: 'Analytics Report',
      description: 'Platform statistics, KPIs, and performance metrics summary',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      fields: ['Metric', 'Value', 'Description'],
      count: 9 // Fixed count for analytics metrics
    },
    {
      id: 'claims',
      title: 'Claims Report',
      description: 'Deal redemptions, savings data, and customer transaction history',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      fields: ['ID', 'User Email', 'Deal Title', 'Vendor', 'Savings Amount', 'Status', 'Claim Date', 'Verification Date'],
      count: analyticsData?.totalClaims || 0
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">
                Download comprehensive CSV reports for analysis and record-keeping
              </p>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Last Updated</span>
              </div>
              <p className="text-lg font-bold text-gray-900 mt-1">Just Now</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Total Records</span>
              </div>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {((analyticsData?.totalUsers || 0) + (analyticsData?.totalVendors || 0) + (analyticsData?.totalDeals || 0) + (analyticsData?.totalClaims || 0)).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Report Types</span>
              </div>
              <p className="text-lg font-bold text-gray-900 mt-1">5</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Format</span>
              </div>
              <p className="text-lg font-bold text-gray-900 mt-1">CSV</p>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const isDownloading = downloadingReport === report.id;
            
            return (
              <Card key={report.id} className={`${report.bgColor} ${report.borderColor} border-2 hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className={`h-6 w-6 ${report.color} mr-2`} />
                      <span className="text-lg font-semibold">{report.title}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {report.count.toLocaleString()} records
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {report.description}
                  </p>
                  
                  {/* Fields Preview */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Included Fields:</p>
                    <div className="flex flex-wrap gap-1">
                      {report.fields.slice(0, 4).map((field) => (
                        <Badge key={field} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                      {report.fields.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{report.fields.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Download Button */}
                  <Button 
                    className="w-full"
                    onClick={() => downloadReport(report.id)}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <Download className="h-4 w-4 mr-2 animate-bounce" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Usage Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-600" />
              Usage Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Download Process</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click any download button to generate a fresh CSV report</li>
                  <li>• Reports include the most current data from the database</li>
                  <li>• Downloads start automatically when ready</li>
                  <li>• All reports use standard CSV format for easy analysis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Data Analysis Tips</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Open CSV files in Excel, Google Sheets, or any spreadsheet app</li>
                  <li>• Use filters and pivot tables for detailed analysis</li>
                  <li>• Combine multiple reports for comprehensive insights</li>
                  <li>• Schedule regular downloads for trend analysis</li>
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