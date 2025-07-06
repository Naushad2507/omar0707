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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  UserCheck, 
  Shield,
  Crown,
  Calendar,
  MapPin,
  Mail,
  Phone,
  MoreHorizontal,
  Plus,
  Settings,
  Activity,
  Eye,
  Lock,
  Unlock
} from "lucide-react";

export default function AdminManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // Filter admin and superadmin users
  const adminUsers = users?.filter((user: any) => 
    user.role === "admin" || user.role === "superadmin"
  ) || [];

  const filteredUsers = adminUsers.filter((user: any) => {
    const matchesSearch = searchQuery === "" || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    if (role === "superadmin") {
      return (
        <Badge className="bg-royal/10 text-royal">
          <Crown className="h-3 w-3 mr-1" />
          Super Admin
        </Badge>
      );
    }
    return (
      <Badge className="bg-warning/10 text-warning">
        <Shield className="h-3 w-3 mr-1" />
        Admin
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-success/10 text-success">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
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
  const totalAdmins = adminUsers.length;
  const superAdmins = adminUsers.filter(u => u.role === "superadmin").length;
  const regularAdmins = adminUsers.filter(u => u.role === "admin").length;
  const activeAdmins = adminUsers.filter(u => u.isActive).length;

  const stats = [
    { label: "Total Admins", value: totalAdmins, icon: UserCheck, color: "text-primary" },
    { label: "Super Admins", value: superAdmins, icon: Crown, color: "text-royal" },
    { label: "Regular Admins", value: regularAdmins, icon: Shield, color: "text-warning" },
    { label: "Active", value: activeAdmins, icon: Activity, color: "text-success" },
  ];

  const permissions = [
    { id: "user_management", name: "User Management", description: "View and manage user accounts" },
    { id: "vendor_management", name: "Vendor Management", description: "Approve and manage vendors" },
    { id: "deal_approval", name: "Deal Approval", description: "Review and approve deals" },
    { id: "analytics_access", name: "Analytics Access", description: "View platform analytics" },
    { id: "system_settings", name: "System Settings", description: "Modify system configurations" },
    { id: "admin_management", name: "Admin Management", description: "Manage admin users (Super Admin only)" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage administrative users and their permissions
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Admin User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Admin User</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <Input placeholder="Enter full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input type="email" placeholder="Enter email address" />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <Input placeholder="Enter username" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="superadmin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <Input type="password" placeholder="Enter temporary password" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                        <input type="checkbox" className="mt-1" />
                        <div>
                          <p className="font-medium text-foreground">{permission.name}</p>
                          <p className="text-sm text-muted-foreground">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button variant="outline">Cancel</Button>
                  <Button>Create Admin User</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                    placeholder="Search admin users..."
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
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Settings className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading admin users...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
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
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.isActive)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Admin User Details - {user.name}</DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-6">
                                  {/* User Info */}
                                  <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="font-medium text-foreground mb-3">Personal Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Name:</span>
                                          <span className="text-foreground font-medium">{user.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Email:</span>
                                          <span className="text-foreground">{user.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Username:</span>
                                          <span className="text-foreground">{user.username}</span>
                                        </div>
                                        {user.phone && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Phone:</span>
                                            <span className="text-foreground">{user.phone}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium text-foreground mb-3">Account Details</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Role:</span>
                                          {getRoleBadge(user.role)}
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Status:</span>
                                          {getStatusBadge(user.isActive)}
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Created:</span>
                                          <span className="text-foreground">{formatDate(user.createdAt)}</span>
                                        </div>
                                        {user.city && user.state && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Location:</span>
                                            <span className="text-foreground">{user.city}, {user.state}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Permissions */}
                                  <div>
                                    <h4 className="font-medium text-foreground mb-3">Permissions</h4>
                                    <div className="grid md:grid-cols-2 gap-3">
                                      {permissions.map((permission) => {
                                        const hasPermission = user.role === "superadmin" || 
                                          (user.role === "admin" && permission.id !== "admin_management");
                                        
                                        return (
                                          <div key={permission.id} className={`flex items-center space-x-2 p-2 rounded ${hasPermission ? 'bg-success/10' : 'bg-gray-50'}`}>
                                            {hasPermission ? (
                                              <Unlock className="h-4 w-4 text-success" />
                                            ) : (
                                              <Lock className="h-4 w-4 text-gray-400" />
                                            )}
                                            <span className={`text-sm ${hasPermission ? 'text-foreground' : 'text-gray-500'}`}>
                                              {permission.name}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No admin users found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "No admin users created yet"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="mt-8 border-royal bg-royal/5">
          <CardHeader>
            <CardTitle className="flex items-center text-royal">
              <Shield className="h-5 w-5 mr-2" />
              Security Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-foreground mb-2">Admin Account Security:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Use strong, unique passwords</li>
                  <li>• Enable two-factor authentication</li>
                  <li>• Regular password updates required</li>
                  <li>• Monitor login activity regularly</li>
                  <li>• Report suspicious activity immediately</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Permission Management:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Grant minimum required permissions</li>
                  <li>• Review permissions quarterly</li>
                  <li>• Super Admin access requires approval</li>
                  <li>• Document all permission changes</li>
                  <li>• Revoke access for inactive users</li>
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
