import React, { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
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
import ImageUpload from "@/components/ui/image-upload";
import PinTracker from "@/components/ui/pin-tracker";

const dealSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  subcategory: z.string().optional(),
  customCategory: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  discountPercentage: z.number().min(1, "Discount must be at least 1%").max(90, "Discount cannot exceed 90%"),
  verificationPin: z.string().min(4, "PIN must be 4 digits").max(4, "PIN must be 4 digits"),
  validUntil: z.string().min(1, "Please select an end date"),
  maxRedemptions: z.number().optional(),
  requiredMembership: z.enum(["basic", "premium", "ultimate"]),
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
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showSubcategory, setShowSubcategory] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Services subcategories structure
  const servicesSubcategories = {
    "cleaning": {
      name: "Cleaning Services",
      subcategories: [
        "House cleaning",
        "Deep cleaning",
        "Carpet cleaning",
        "Window cleaning"
      ]
    },
    "repair-maintenance": {
      name: "Repair & Maintenance",
      subcategories: [
        "Plumbing",
        "Electrical repairs",
        "HVAC maintenance",
        "Appliance repair"
      ]
    },
    "home-improvement": {
      name: "Home Improvement",
      subcategories: [
        "Painting",
        "Flooring installation",
        "Kitchen remodeling",
        "Bathroom renovation"
      ]
    },
    "lawn-garden": {
      name: "Lawn & Garden",
      subcategories: [
        "Lawn mowing",
        "Landscaping",
        "Tree trimming",
        "Pest control"
      ]
    },
    "moving-storage": {
      name: "Moving & Storage",
      subcategories: [
        "Local moving",
        "Long-distance moving",
        "Packing services",
        "Storage solution"
      ]
    },
    "ride-services": {
      name: "Ride Services",
      subcategories: [
        "Economy rides",
        "Premium rides",
        "Shared rides",
        "Airport transfers"
      ]
    },
    "delivery": {
      name: "Delivery Services",
      subcategories: [
        "Food delivery",
        "Grocery delivery",
        "Package delivery",
        "Courier services"
      ]
    },
    "event-services": {
      name: "Event Services",
      subcategories: [
        "Event planning",
        "Catering",
        "Photography",
        "DJ or entertainment"
      ]
    },
    "pet-services": {
      name: "Pet Services",
      subcategories: [
        "Pet grooming",
        "Dog walking",
        "Pet sitting"
      ]
    },
    "rental-services": {
      name: "Rental Services",
      subcategories: [
        "Equipment rentals (e.g., cameras, tools)",
        "Clothing rentals",
        "Furniture rentals",
        "Vehicle rentals"
      ]
    },
    "local-experiences": {
      name: "Local Experiences",
      subcategories: [
        "Guided tours",
        "Adventure activities",
        "Cultural workshops",
        "Food tours"
      ]
    },
    "cooking-classes": {
      name: "Cooking Classes",
      subcategories: [
        "Online cooking lessons",
        "In-person workshops",
        "Baking classes",
        "International cuisine lessons"
      ]
    }
  };

  const { data: vendor } = useQuery({
    queryKey: ["/api/vendors/me"],
  });

  const { data: deals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/vendors/deals"],
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<DealForm>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      subcategory: "",
      customCategory: "",
      imageUrl: "",
      discountPercentage: 10,
      verificationPin: "",
      validUntil: "",
      maxRedemptions: undefined,
      requiredMembership: "basic",
      address: "",
      latitude: undefined,
      longitude: undefined,
      useCurrentLocation: false,
    },
  });

  // Watch category selection to show/hide custom category field and subcategories
  const watchedCategory = form.watch("category");
  
  // Show custom category field when "others" is selected
  // Show subcategory field when "services" is selected
  React.useEffect(() => {
    setShowCustomCategory(watchedCategory === "others");
    setShowSubcategory(watchedCategory === "services");
    
    // Clear subcategory when not services
    if (watchedCategory !== "services") {
      form.setValue("subcategory", "");
    }
  }, [watchedCategory, form]);

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
          title: "Location updated",
          description: "Your current location has been set for this deal.",
        });
      },
      (error) => {
        setLocationError(error.message);
        setIsGettingLocation(false);
        toast({
          title: "Location Error",
          description: "Could not get your current location.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const createDealMutation = useMutation({
    mutationFn: async (data: DealForm) => {
      // Use custom category if "others" is selected and transform data types
      const finalData = {
        ...data,
        category: data.category === "others" && data.customCategory ? data.customCategory : data.category,
        subcategory: data.subcategory || null,
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : undefined,
        latitude: data.latitude ? data.latitude.toString() : undefined,
        longitude: data.longitude ? data.longitude.toString() : undefined,
      };
      return apiRequest('/api/vendors/deals', 'POST', finalData);
    },
    onSuccess: () => {
      toast({
        title: "Deal created successfully!",
        description: "Your deal has been submitted for admin approval.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors/deals"] });
      setIsCreateOpen(false);
      form.reset();
      setShowCustomCategory(false);
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
    mutationFn: async (data: DealForm) => {
      if (!editingDeal) throw new Error("No deal selected for editing");
      
      // Use custom category if "others" is selected and transform data types
      const finalData = {
        ...data,
        category: data.category === "others" && data.customCategory ? data.customCategory : data.category,
        subcategory: data.subcategory || null,
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : undefined,
        latitude: data.latitude ? data.latitude.toString() : undefined,
        longitude: data.longitude ? data.longitude.toString() : undefined,
      };
      return apiRequest(`/api/vendors/deals/${editingDeal.id}`, 'PUT', finalData);
    },
    onSuccess: () => {
      toast({
        title: "Deal updated successfully!",
        description: "Your changes have been submitted and require admin approval before going live.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors/deals"] });
      setEditingDeal(null);
      form.reset();
      setShowCustomCategory(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update deal",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: DealForm) => {
    if (editingDeal) {
      updateDealMutation.mutate(data);
    } else {
      createDealMutation.mutate(data);
    }
  };

  const handleEdit = (deal: any) => {
    const isOthersCategory = !categories.find((cat: any) => cat.id === deal.category);
    const isServicesCategory = deal.category === "services";
    
    form.reset({
      title: deal.title,
      description: deal.description,
      category: isOthersCategory ? "others" : deal.category,
      subcategory: deal.subcategory || "",
      customCategory: isOthersCategory ? deal.category : "",
      imageUrl: deal.imageUrl || "",
      discountPercentage: deal.discountPercentage,
      verificationPin: deal.verificationPin || "",
      validUntil: new Date(deal.validUntil).toISOString().split('T')[0],
      maxRedemptions: deal.maxRedemptions,
      requiredMembership: deal.requiredMembership,
      address: deal.address,
      latitude: deal.latitude ? parseFloat(deal.latitude) : undefined,
      longitude: deal.longitude ? parseFloat(deal.longitude) : undefined,
      useCurrentLocation: false,
    });
    
    setShowCustomCategory(isOthersCategory);
    setShowSubcategory(isServicesCategory);
    setEditingDeal(deal);
  };

  const handleCloseDialog = () => {
    setIsCreateOpen(false);
    setEditingDeal(null);
    form.reset();
    setShowCustomCategory(false);
    setShowSubcategory(false);
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

  const stats = [
    {
      title: "Total Deals",
      value: deals.length,
      icon: Target,
      change: "+12%",
      changeType: "increase" as const,
    },
    {
      title: "Active Deals",
      value: deals.filter((deal: any) => deal.isActive && deal.isApproved).length,
      icon: TrendingUp,
      change: "+8%",
      changeType: "increase" as const,
    },
    {
      title: "Total Views",
      value: deals.reduce((acc: number, deal: any) => acc + (deal.viewCount || 0), 0),
      icon: Eye,
      change: "+15%",
      changeType: "increase" as const,
    },
    {
      title: "Total Claims",
      value: deals.reduce((acc: number, deal: any) => acc + (deal.currentRedemptions || 0), 0),
      icon: Calendar,
      change: "+22%",
      changeType: "increase" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Deals</h1>
              <p className="text-gray-600 mt-1">
                Create and manage your deals
              </p>
            </div>
            <Dialog open={isCreateOpen || !!editingDeal} onOpenChange={(open) => {
              if (!open) handleCloseDialog();
              else setIsCreateOpen(true);
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Deal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">
                    {editingDeal ? "Edit Deal" : "Create New Deal"}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600">
                    {editingDeal 
                      ? "Update your deal information. Changes will need admin approval before going live."
                      : "Create a new deal for your customers. Fill in all required fields marked with *."
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    {/* Row 1: Title and Discount */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Deal Title *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter deal title"
                                className="h-12 text-base"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="discountPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Discount % *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                placeholder="10"
                                className="h-12 text-base"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Row 2: Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Describe your deal"
                              className="min-h-[80px] text-base resize-none"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Row 3: Category and PIN */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Category *</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setShowCustomCategory(value === "others");
                                setShowSubcategory(value === "services");
                                if (value !== "services") {
                                  form.setValue("subcategory", "");
                                }
                              }} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category: any) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                                {!categories.find((cat: any) => cat.id === "others") && (
                                  <SelectItem key="others-custom" value="others">Others</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="verificationPin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Verification PIN *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="4-digit PIN"
                                maxLength={4}
                                pattern="[0-9]{4}"
                                className="h-12 text-base text-center font-mono"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              4-digit PIN for offline verification
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Conditional: Service Type */}
                    {showSubcategory && (
                      <FormField
                        control={form.control}
                        name="subcategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Service Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Select service type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(servicesSubcategories).map(([key, category]) => (
                                  <div key={key}>
                                    <div className="px-2 py-1 text-sm font-semibold text-gray-700 bg-gray-100 border-b">
                                      {category.name}
                                    </div>
                                    {category.subcategories.map((subcategory) => (
                                      <SelectItem 
                                        key={`${key}-${subcategory}`} 
                                        value={`${key}:${subcategory}`}
                                        className="pl-4"
                                      >
                                        {subcategory}
                                      </SelectItem>
                                    ))}
                                  </div>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Conditional: Custom Category */}
                    {showCustomCategory && (
                      <FormField
                        control={form.control}
                        name="customCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Custom Category</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter custom category name"
                                className="h-12 text-base"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Row 4: Valid Until and Max Redemptions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="validUntil"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Valid Until</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field}
                                className="h-12 text-base"
                              />
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
                            <FormLabel className="text-sm">Max Redemptions</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="Unlimited"
                                className="h-12 text-base"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Row 5: Required Membership */}
                    <FormField
                      control={form.control}
                      name="requiredMembership"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Required Membership</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="ultimate">Ultimate</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Row 6: Address */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Enter full address"
                              className="min-h-[60px] text-base resize-none"
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Location Button */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className="h-10 text-sm"
                        size="sm"
                      >
                        {isGettingLocation ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Navigation className="h-4 w-4 mr-2" />
                        )}
                        Use Current Location
                      </Button>
                      
                      {locationError && (
                        <p className="text-xs text-red-600">{locationError}</p>
                      )}
                    </div>

                    {/* Row 7: Image Upload */}
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Deal Image</FormLabel>
                          <FormControl>
                            <ImageUpload
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Upload deal image or enter URL"
                              maxSizeInMB={5}
                              allowCamera={true}
                              showPreview={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseDialog}
                        className="h-12 text-base flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createDealMutation.isPending || updateDealMutation.isPending}
                        className="h-12 text-base flex-1"
                      >
                        {(createDealMutation.isPending || updateDealMutation.isPending) ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {editingDeal ? "Update Deal" : "Create Deal"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Deals List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Deals</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading deals...</p>
              </div>
            ) : deals.length > 0 ? (
              <div className="space-y-4">
                {deals.map((deal: any) => (
                  <div key={deal.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {deal.title}
                          </h3>
                          {getDealStatusBadge(deal)}
                        </div>
                        <p className="text-gray-600 mb-3">{deal.description}</p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Target className="h-4 w-4 text-gray-400" />
                            <span>Category: {deal.category}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            <span>Discount: {deal.discountPercentage}%</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4 text-gray-400" />
                            <span>Views: {deal.viewCount || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Claims: {deal.currentRedemptions || 0}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>Valid until: {new Date(deal.validUntil).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(deal)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No deals yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first deal to start attracting customers
                </p>
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