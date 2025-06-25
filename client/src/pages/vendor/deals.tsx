import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Loader2,
  AlertCircle,
  MapPin,
  Navigation,
  Crosshair
} from "lucide-react";

const dealSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  discountPercentage: z.number().min(1, "Discount must be at least 1%").max(90, "Discount cannot exceed 90%"),
  discountCode: z.string().optional(),
  originalPrice: z.string().optional(),
  discountedPrice: z.string().optional(),
  validUntil: z.string().min(1, "Please select an end date"),
  maxRedemptions: z.number().optional(),
  requiredMembership: z.enum(["basic", "premium", "ultimate"]),
  // Location fields
  address: z.string().min(1, "Address is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  useCurrentLocation: z.boolean().optional(),
});

type DealForm = z.infer<typeof dealSchema>;

export default function VendorDeals() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vendor } = useQuery({
    queryKey: ["/api/vendors/me"],
  });

  const { data: deals, isLoading } = useQuery({
    queryKey: ["/api/vendors/deals"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const form = useForm<DealForm>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      imageUrl: "",
      discountPercentage: 10,
      discountCode: "",
      originalPrice: "",
      discountedPrice: "",
      validUntil: "",
      maxRedemptions: undefined,
      requiredMembership: "basic",
      address: "",
      latitude: undefined,
      longitude: undefined,
      useCurrentLocation: false,
    },
  });

  // Geolocation function
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue("latitude", latitude);
        form.setValue("longitude", longitude);
        form.setValue("useCurrentLocation", true);
        setIsGettingLocation(false);
        toast({
          title: "Location captured!",
          description: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
        });
      },
      (error) => {
        let errorMessage = "Failed to get location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const createDealMutation = useMutation({
    mutationFn: async (data: DealForm) => {
      return apiRequest('POST', '/api/vendors/deals', {
        ...data,
        originalPrice: data.originalPrice ? data.originalPrice : null,
        discountedPrice: data.discountedPrice ? data.discountedPrice : null,
        maxRedemptions: data.maxRedemptions || null,
        discountCode: data.discountCode || null,
        imageUrl: data.imageUrl || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Deal created successfully!",
        description: "Your deal has been submitted for approval.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors/deals"] });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create deal",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const updateDealMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DealForm> }) => {
      return apiRequest('PUT', `/api/vendors/deals/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Deal updated successfully!",
        description: "Your changes have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors/deals"] });
      setEditingDeal(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update deal",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const deleteDealMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/vendors/deals/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Deal deleted successfully!",
        description: "The deal has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors/deals"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete deal",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DealForm) => {
    if (editingDeal) {
      updateDealMutation.mutate({ id: editingDeal.id, data });
    } else {
      createDealMutation.mutate(data);
    }
  };

  const handleEdit = (deal: any) => {
    setEditingDeal(deal);
    form.reset({
      title: deal.title,
      description: deal.description,
      category: deal.category,
      imageUrl: deal.imageUrl || "",
      discountPercentage: deal.discountPercentage,
      discountCode: deal.discountCode || "",
      originalPrice: deal.originalPrice || "",
      discountedPrice: deal.discountedPrice || "",
      validUntil: deal.validUntil.split('T')[0], // Format for date input
      maxRedemptions: deal.maxRedemptions || undefined,
      requiredMembership: deal.requiredMembership,
    });
  };

  const getDealStatusBadge = (deal: any) => {
    if (!deal.isApproved) {
      return <Badge variant="secondary">Pending Approval</Badge>;
    }
    if (!deal.isActive) {
      return <Badge variant="outline">Inactive</Badge>;
    }
    if (new Date(deal.validUntil) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge className="bg-success text-white">Active</Badge>;
  };

  const activeDeals = deals?.filter((deal: any) => deal.isActive && deal.isApproved).length || 0;
  const pendingDeals = deals?.filter((deal: any) => !deal.isApproved).length || 0;
  const totalViews = deals?.reduce((sum: number, deal: any) => sum + (deal.viewCount || 0), 0) || 0;
  const totalClaims = deals?.reduce((sum: number, deal: any) => sum + (deal.currentRedemptions || 0), 0) || 0;

  const stats = [
    { label: "Active Deals", value: activeDeals, icon: Target, color: "text-success" },
    { label: "Pending Approval", value: pendingDeals, icon: Clock, color: "text-warning" },
    { label: "Total Views", value: totalViews, icon: Eye, color: "text-primary" },
    { label: "Total Claims", value: totalClaims, icon: TrendingUp, color: "text-royal" },
  ];

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Vendor Registration Required</h3>
              <p className="text-gray-600 mb-4">Please complete your vendor registration to manage deals</p>
              <Button onClick={() => window.location.href = "/vendor/register"}>
                Register Now
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!vendor.isApproved) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="border-warning bg-warning/5">
            <CardContent className="p-12 text-center">
              <Clock className="h-12 w-12 text-warning mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Account Under Review</h3>
              <p className="text-gray-600 mb-4">
                Your vendor account is currently being reviewed. You'll be able to create deals once approved.
              </p>
              <Button variant="outline" onClick={() => window.location.href = "/vendor/dashboard"}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Deals</h1>
            <p className="text-gray-600 mt-1">Create and manage your business deals</p>
          </div>
          
          <Dialog open={isCreateOpen || !!editingDeal} onOpenChange={(open) => {
            if (!open) {
              setIsCreateOpen(false);
              setEditingDeal(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingDeal ? "Edit Deal" : "Create New Deal"}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter an attractive deal title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your deal in detail..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category: any) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Percentage *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="90"
                              placeholder="10"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          Provide a URL to an image that represents your deal
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price (₹)</FormLabel>
                          <FormControl>
                            <Input placeholder="1000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountedPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discounted Price (₹)</FormLabel>
                          <FormControl>
                            <Input placeholder="900" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="validUntil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valid Until *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxRedemptions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Redemptions</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              placeholder="100"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>Leave empty for unlimited</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="discountCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Code</FormLabel>
                          <FormControl>
                            <Input placeholder="SAVE20" {...field} />
                          </FormControl>
                          <FormDescription>Optional promo code</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requiredMembership"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Required Membership *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="basic">Basic (Free)</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="ultimate">Ultimate</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Location Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Navigation className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-medium">Location Information</h3>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Address *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your business address"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>Full address where customers can find your deal</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Crosshair className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">GPS Coordinates</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Add precise location for better nearby deal discovery
                        </p>
                        {form.watch("latitude") && form.watch("longitude") && (
                          <p className="text-xs text-green-600 mt-1">
                            Location captured: {form.watch("latitude")?.toFixed(6)}, {form.watch("longitude")?.toFixed(6)}
                          </p>
                        )}
                        {locationError && (
                          <p className="text-xs text-red-600 mt-1">{locationError}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className="flex items-center space-x-2"
                      >
                        {isGettingLocation ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Crosshair className="h-4 w-4" />
                        )}
                        <span>{isGettingLocation ? "Getting..." : "Get Location"}</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setIsCreateOpen(false);
                        setEditingDeal(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createDealMutation.isPending || updateDealMutation.isPending}
                    >
                      {(createDealMutation.isPending || updateDealMutation.isPending) && 
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      }
                      {editingDeal ? "Update Deal" : "Create Deal"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Deals List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Deals ({deals?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-gray-600">Loading deals...</p>
              </div>
            ) : deals && deals.length > 0 ? (
              <div className="space-y-4">
                {deals.map((deal: any) => (
                  <div key={deal.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{deal.title}</h3>
                          {getDealStatusBadge(deal)}
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{deal.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Category:</span>
                            <p className="font-medium text-gray-900 capitalize">{deal.category}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Discount:</span>
                            <p className="font-medium text-gray-900">{deal.discountPercentage}%</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Views:</span>
                            <p className="font-medium text-gray-900">{deal.viewCount || 0}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Claims:</span>
                            <p className="font-medium text-gray-900">
                              {deal.currentRedemptions || 0}
                              {deal.maxRedemptions && `/${deal.maxRedemptions}`}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(deal)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Deal</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{deal.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteDealMutation.mutate(deal.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Valid until {new Date(deal.validUntil).toLocaleDateString('en-IN')}
                      </span>
                      <span className="capitalize">
                        Requires {deal.requiredMembership} membership
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No deals created yet</h3>
                <p className="text-gray-600 mb-4">Create your first deal to start attracting customers</p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Deal
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
