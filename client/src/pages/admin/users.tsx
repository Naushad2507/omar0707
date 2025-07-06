import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  Users, 
  Crown,
  Gift,
  Calendar,
  MapPin,
  Mail,
  Phone,
  MoreHorizontal,
  UserCheck,
  Loader2
} from "lucide-react";

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const upgradeUserMutation = useMutation({
    mutationFn: async ({ userId, membershipPlan }: { userId: number; membershipPlan: string }) => {
      return apiRequest(`/api/admin/users/${userId}/upgrade`, 'PUT', { membershipPlan });
    },
    onSuccess: () => {
      toast({
        title: "User upgraded successfully!",
        description: "The user's membership plan has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to upgrade user",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Filter users based on search and filters
  const filteredUsers = users?.filter((user: any) => {
    const matchesSearch = searchQuery === "" || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.city && user.city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesMembership = membershipFilter === "all" || user.membershipPlan === membershipFilter;

    return matchesSearch && matchesRole && matchesMembership;
  }) || [];

  const getRoleBadge = (role: string) => {
    const colors = {
      customer: "bg-primary/10 text-primary",
      vendor: "bg-success/10 text-success",
      admin: "bg-warning/10 text-warning",
      superadmin: "bg-royal/10 text-royal",
    };

    return (
      <Badge className={colors[role as keyof typeof colors] || "bg-gray-100 text-gray-700"}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getMembershipBadge = (plan: string | null | undefined, isPromotional?: boolean) => {
    // Fallback if plan is null or undefined
    const safePlan = plan || "Unknown";
    const colors = {
      basic: "bg-gray-100 text-gray-700",
      premium: "bg-primary/10 text-primary",
      ultimate: "bg-royal/10 text-royal",
      Unknown: "bg-gray-100 text-gray-700", // Fallback color
    };

    return (
      <div className="flex items-center space-x-1">
        <Badge className={colors[safePlan as keyof typeof colors] || "bg-gray-100 text-gray-700"}>
          {safePlan.charAt(0).toUpperCase() + safePlan.slice(1)}
        </Badge>
        {isPromotional && (
          <Gift className="h-3 w-3 text-success" title="Promotional Plan" />
        )}
      </div>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  // Calculate summary stats
  const totalUsers = users?.length || 0;
  const customerCount = users?.filter((u: any) => u.role === "customer").length || 0;
  const vendorCount = users?.filter((u: any) => u.role === "vendor").length || 0;
  const premiumUsers = users?.filter((u: any) => u.membershipPlan !== "basic").length || 0;
  const promotionalUsers = users?.filter((u: any) => u.isPromotionalUser).length || 0;

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-primary" },
    { label: "Customers", value: customerCount, icon: Users, color: "text-success" },
    { label: "Vendors", value: vendorCount, icon: Users, color: "text-warning" },
    { label: "Premium Members", value: premiumUsers, icon: Crown, color: "text-royal" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all platform users
          </p>
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
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                  <SelectItem value="vendor">Vendors</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="superadmin">Super Admins</SelectItem>
                </SelectContent>
              </Select>

              <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                <SelectTrigger>
                  <Crown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Memberships</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="ultimate">Ultimate</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setMembershipFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Sorted by join date (newest first)</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading users...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Membership</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Savings</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Mail className="h-3 w-3" />
                                <span>{user.email}</span>
                              </div>
                              {user.phone && (
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <Phone className="h-3 w-3" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.role)}
                        </TableCell>
                        <TableCell>
                          {getMembershipBadge(user.membershipPlan, user.isPromotionalUser)}
                          {user.membershipExpiry && (
                            <p className="text-xs text-gray-500 mt-1">
                              Expires: {formatDate(user.membershipExpiry)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.city && user.state ? (
                            <div className="flex items-center space-x-1 text-sm">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span>{user.city}, {user.state}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium text-success">₹{parseFloat(user.totalSavings || "0").toLocaleString('en-IN')}</p>
                            <p className="text-xs text-gray-500">{user.dealsClaimed || 0} deals claimed</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={user.isActive ? "bg-success/10 text-success" : "bg-gray-100 text-gray-700"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Manage User: {user.name}</DialogTitle>
                                <DialogDescription>
                                  Update the user's membership tier and account settings.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Change Membership Tier</label>
                                  <Select 
                                    defaultValue={user.membershipPlan || "basic"}
                                    onValueChange={(value) => {
                                      upgradeUserMutation.mutate({
                                        userId: user.id,
                                        membershipPlan: value
                                      });
                                    }}
                                  >
                                    <SelectTrigger className="mt-2">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="basic">Basic</SelectItem>
                                      <SelectItem value="premium">Premium</SelectItem>
                                      <SelectItem value="ultimate">Ultimate</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="text-xs text-gray-500">
                                  <p>Current tier: {user.membershipPlan || "basic"}</p>
                                  {user.membershipExpiry && (
                                    <p>Expires: {formatDate(user.membershipExpiry)}</p>
                                  )}
                                </div>
                              </div>
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
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || roleFilter !== "all" || membershipFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "No users registered yet"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Promotional Users Highlight */}
        {promotionalUsers > 0 && (
          <Card className="mt-8 border-success bg-success/5">
            <CardHeader>
              <CardTitle className="flex items-center text-success">
                <Gift className="h-5 w-5 mr-2" />
                Promotional Plan Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">{promotionalUsers} users are on the promotional plan</p>
                  <p className="text-muted-foreground text-sm">
                    Free Premium membership until August 14, 2026
                  </p>
                </div>
                <Badge className="bg-success text-white">
                  Special Offer Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}