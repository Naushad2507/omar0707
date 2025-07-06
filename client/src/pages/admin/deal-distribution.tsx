import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3, 
  Trash2, 
  RefreshCw, 
  Package, 
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

export default function DealDistribution() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Fetch deal distribution data
  const { data: dealDistribution, isLoading } = useQuery<Record<string, number>>({
    queryKey: ["/api/admin/deal-distribution"],
    enabled: user?.role === "admin" || user?.role === "superadmin",
  });

  // Delete deals by category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (category: string) => {
      return apiRequest(`/api/admin/deals/category/${category}`, 'DELETE');
    },
    onSuccess: (_, category) => {
      toast({
        title: "Category Deleted",
        description: `All deals in ${category} category have been deleted.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deal-distribution"] });
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setLoadingAction(null);
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete category deals. Please try again.",
        variant: "destructive",
      });
      setLoadingAction(null);
    },
  });

  // Reset all deals mutation
  const resetAllMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/admin/deals/reset', 'POST');
    },
    onSuccess: () => {
      toast({
        title: "All Deals Reset",
        description: "All deals have been cleared from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deal-distribution"] });
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setLoadingAction(null);
    },
    onError: () => {
      toast({
        title: "Reset Failed",
        description: "Failed to reset deals. Please try again.",
        variant: "destructive",
      });
      setLoadingAction(null);
    },
  });

  const handleDeleteCategory = (category: string) => {
    if (window.confirm(`Are you sure you want to delete all deals in the ${category} category? This action cannot be undone.`)) {
      setLoadingAction(`delete-${category}`);
      deleteCategoryMutation.mutate(category);
    }
  };

  const handleResetAll = () => {
    if (window.confirm("Are you sure you want to delete ALL deals? This will clear the entire deal database and cannot be undone.")) {
      setLoadingAction("reset-all");
      resetAllMutation.mutate();
    }
  };

  const getTotalDeals = () => {
    if (!dealDistribution) return 0;
    return Object.values(dealDistribution).reduce((sum, count) => sum + count, 0);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      fashion: "bg-pink-100 text-pink-800",
      electronics: "bg-blue-100 text-blue-800",
      restaurants: "bg-green-100 text-green-800",
      beauty: "bg-purple-100 text-purple-800",
      travel: "bg-yellow-100 text-yellow-800",
      home: "bg-indigo-100 text-indigo-800",
      automotive: "bg-red-100 text-red-800",
      health: "bg-teal-100 text-teal-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Access denied. This page is only available to administrators.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Deal Distribution by Category</h1>
          <p className="text-muted-foreground">Manage and monitor deal distribution across different categories for testing purposes.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Deals</p>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? "..." : getTotalDeals()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? "..." : Object.keys(dealDistribution || {}).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg per Category</p>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? "..." : Math.round(getTotalDeals() / Math.max(Object.keys(dealDistribution || {}).length, 1))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deal Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Deal Distribution by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading deal distribution...</div>
            ) : dealDistribution && Object.keys(dealDistribution).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(dealDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge className={getCategoryColor(category)}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Badge>
                      <div className="flex-1">
                        <div className="w-64 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(count / Math.max(...Object.values(dealDistribution))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-foreground w-16 text-right">
                        {count}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                      disabled={loadingAction === `delete-${category}`}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {loadingAction === `delete-${category}` ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No deals found in the system.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  These actions are permanent and cannot be undone. Use only for testing purposes.
                </AlertDescription>
              </Alert>
              
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h3 className="font-semibold text-red-900">Reset All Deals</h3>
                  <p className="text-sm text-red-700">Remove all deals from the system to start fresh testing.</p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleResetAll}
                  disabled={loadingAction === "reset-all"}
                >
                  {loadingAction === "reset-all" ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Reset All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}