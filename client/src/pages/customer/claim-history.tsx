import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { 
  Search, 
  Calendar,
  MapPin, 
  Clock, 
  TrendingUp,
  PiggyBank,
  Ticket,
  Filter,
  FileText
} from "lucide-react";

export default function ClaimHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const { user } = useAuth();

  const { data: claims, isLoading } = useQuery({
    queryKey: ["/api/users/claims"],
  });

  const { data: userDetails } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  if (!user) return null;

  const currentUser = userDetails || user;

  // Filter and sort claims
  const filteredClaims = claims?.filter((claim: any) => {
    const matchesSearch = searchQuery === "" || 
      claim.deal?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.vendor?.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || claim.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const sortedClaims = [...filteredClaims].sort((a: any, b: any) => {
    switch (sortBy) {
      case "savings":
        return parseFloat(b.savingsAmount) - parseFloat(a.savingsAmount);
      case "oldest":
        return new Date(a.claimedAt).getTime() - new Date(b.claimedAt).getTime();
      default: // newest
        return new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime();
    }
  });

  // Calculate summary stats
  const totalSavings = claims?.reduce((sum: number, claim: any) => sum + parseFloat(claim.savingsAmount), 0) || 0;
  const usedClaims = claims?.filter((claim: any) => claim.status === "used").length || 0;
  const pendingClaims = claims?.filter((claim: any) => claim.status === "claimed").length || 0;

  const summaryStats = [
    {
      title: "Total Claims",
      value: claims?.length || 0,
      icon: Ticket,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Savings",
      value: `₹${totalSavings.toLocaleString('en-IN')}`,
      icon: PiggyBank,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Used Claims",
      value: usedClaims,
      icon: TrendingUp,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Pending Claims",
      value: pendingClaims,
      icon: Clock,
      color: "text-saffron",
      bgColor: "bg-saffron/10",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "used":
        return "bg-success text-white";
      case "expired":
        return "bg-destructive text-white";
      default:
        return "bg-warning text-white";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Claim History</h1>
          <p className="text-gray-600">
            Track all your claimed deals and savings in one place
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {summaryStats.map((stat) => {
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

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search claims..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="savings">Highest Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Claims List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Claims ({sortedClaims.length})</span>
              <Button variant="outline" asChild>
                <Link to="/customer/deals">Browse More Deals</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading claims...</p>
              </div>
            ) : sortedClaims.length > 0 ? (
              <div className="space-y-4">
                {sortedClaims.map((claim: any) => (
                  <div key={claim.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Deal Image */}
                        {claim.deal?.imageUrl && (
                          <img 
                            src={claim.deal.imageUrl} 
                            alt={claim.deal.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        
                        {/* Deal Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {claim.deal?.title || "Deal not available"}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {claim.deal?.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Claimed {formatDate(claim.claimedAt)}
                            </span>
                            {claim.vendor && (
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {claim.vendor.businessName}, {claim.vendor.city}
                              </span>
                            )}
                            {claim.usedAt && (
                              <span className="flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Used {formatDate(claim.usedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Savings and Status */}
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-lg font-bold text-success mb-2">
                          Saved ₹{parseFloat(claim.savingsAmount).toLocaleString('en-IN')}
                        </p>
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                        </Badge>
                        
                        {claim.deal?.discountCode && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <span className="font-mono">{claim.deal.discountCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || filterStatus !== "all" ? "No claims found" : "No claims yet"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filterStatus !== "all" 
                    ? "Try adjusting your search or filters"
                    : "Start claiming deals to see your history here"
                  }
                </p>
                <Button asChild>
                  <Link to="/customer/deals">Browse Deals</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
