import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { majorCities } from "@/lib/cities";
import ImageUpload from "@/components/ui/image-upload";
import PinTracker from "@/components/ui/pin-tracker";
import { 
  Plus, 
  Loader2, 
  CheckCircle, 
  FileText, 
  MapPin, 
  Clock, 
  Target,
  Edit,
  Trash2,
  Eye,
  Percent,
  ArrowLeft 
} from "lucide-react";

// Compact form schema
const dealFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  customCategory: z.string().optional(),
  discountPercentage: z.number().min(1).max(90),
  verificationPin: z.string().length(4, "PIN must be 4 digits"),
  dealAvailability: z.enum(["all-stores", "selected-locations"]),
  selectedCities: z.array(z.string()).optional(),
  validUntil: z.string().min(1, "Valid until date is required"),
  termsAndConditions: z.string().optional(),
  imageUrl: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to terms")
});

type DealFormData = z.infer<typeof dealFormSchema>;

export default function CompactDealsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [viewingDeal, setViewingDeal] = useState<any>(null);

  // Fetch business categories
  const { data: businessCategories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch vendor deals
  const { data: deals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/vendors/deals"],
  });

  const form = useForm<DealFormData>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      subcategory: "",
      customCategory: "",
      discountPercentage: 0,
      verificationPin: "",
      dealAvailability: "all-stores",
      selectedCities: [],
      validUntil: "",
      termsAndConditions: "",
      imageUrl: "",
      agreeToTerms: false,
    },
  });

  const selectedAvailability = form.watch("dealAvailability");
  const selectedCategory = form.watch("category");
  
  // Reset subcategory when category changes
  useEffect(() => {
    if (selectedCategory !== "services") {
      form.setValue("subcategory", "");
      form.setValue("customCategory", "");
    }
  }, [selectedCategory, form]);
  
  // Define subcategories for services
  const serviceSubcategories = [
    "House cleaning",
    "Deep cleaning", 
    "Carpet cleaning",
    "Window cleaning",
    "Plumbing",
    "Electrical repairs",
    "HVAC maintenance",
    "Appliance repair",
    "Painting",
    "Flooring installation",
    "Kitchen remodeling",
    "Bathroom renovation",
    "Lawn mowing",
    "Landscaping",
    "Tree trimming",
    "Pest control",
    "Local moving",
    "Long-distance moving",
    "Packing services",
    "Storage solution",
    "Economy rides",
    "Premium rides",
    "Shared rides",
    "Airport transfers",
    "Food delivery",
    "Grocery delivery",
    "Package delivery",
    "Courier services",
    "Event planning",
    "Catering",
    "Photography",
    "DJ or entertainment",
    "Pet grooming",
    "Dog walking",
    "Pet sitting",
    "Equipment rentals (e.g., cameras, tools)",
    "Clothing rentals",
    "Furniture rentals",
    "Vehicle rentals",
    "Guided tours",
    "Adventure activities",
    "Cultural workshops",
    "Food tours",
    "Online cooking lessons",
    "In-person workshops",
    "Baking classes",
    "International cuisine lessons"
  ];

  const createDealMutation = useMutation({
    mutationFn: async (data: DealFormData) => {
      const response = await apiRequest("/api/magic/deals/vendor", "POST", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Deal Created Successfully",
        description: "Your deal has been submitted for admin approval.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors/deals"] });
      form.reset();
      setIsCreateOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create deal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DealFormData) => {
    createDealMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center gap-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Deals</h1>
              <p className="text-gray-600">Create and manage your business deals</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {/* PIN Tracker */}
            <PinTracker deals={deals.map(deal => ({
              id: deal.id,
              title: deal.title,
              category: deal.category,
              discountPercentage: deal.discountPercentage,
              verificationPin: deal.verificationPin,
              validUntil: deal.validUntil,
              status: deal.approved ? 'active' : 'pending',
              claimsCount: deal.claimsCount || 0,
              maxRedemptions: deal.maxRedemptions
            }))} />
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Deal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[98vh] overflow-y-auto p-4">
                <DialogHeader>
                  <DialogTitle>Create New Deal</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                    
                    {/* Row 1: Basic Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Deal Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter deal title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Category *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {businessCategories.map((category) => (
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
                            <FormLabel className="text-sm">Discount % *</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="90"
                                  placeholder="Enter discount"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                                <Percent className="h-4 w-4 text-gray-500" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Row 1.5: Subcategory for Services */}
                    {selectedCategory === "services" && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="subcategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Service Subcategory *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select service type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {serviceSubcategories.map((subcategory) => (
                                    <SelectItem key={subcategory} value={subcategory}>
                                      {subcategory}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="others">Others</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Custom category field for "Others" */}
                        {form.watch("subcategory") === "others" && (
                          <FormField
                            control={form.control}
                            name="customCategory"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Custom Service Type *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter custom service type" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    )}

                    {/* Row 2: Description and PIN */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your deal"
                                className="min-h-[60px]"
                                {...field} 
                              />
                            </FormControl>
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
                              <div className="flex items-center space-x-2">
                                <Input 
                                  type="text" 
                                  maxLength={4}
                                  placeholder="Enter 4-digit PIN"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    field.onChange(value);
                                  }}
                                />
                                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription className="text-xs">
                              Customers will use this PIN for the 3-step claiming process: 1) Claim online, 2) Visit store for PIN, 3) Verify & add bill amount
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Row 3: Availability and Date */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="dealAvailability"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Availability *</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="all-stores" id="all-stores" />
                                  <label htmlFor="all-stores" className="text-sm">
                                    All Stores
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="selected-locations" id="selected-locations" />
                                  <label htmlFor="selected-locations" className="text-sm">
                                    Selected Locations
                                  </label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="validUntil"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Valid Until *</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                min={new Date().toISOString().split('T')[0]}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Row 4: City Selection (if needed) */}
                    {selectedAvailability === "selected-locations" && (
                      <FormField
                        control={form.control}
                        name="selectedCities"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Select Cities *</FormLabel>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-h-24 overflow-y-auto border rounded p-2">
                              {majorCities.map((city) => (
                                <div key={city.name} className="flex items-center space-x-1">
                                  <Checkbox
                                    id={city.name}
                                    checked={field.value?.includes(city.name) || false}
                                    onCheckedChange={(checked) => {
                                      const currentCities = field.value || [];
                                      if (checked) {
                                        field.onChange([...currentCities, city.name]);
                                      } else {
                                        field.onChange(currentCities.filter(c => c !== city.name));
                                      }
                                    }}
                                  />
                                  <label htmlFor={city.name} className="text-xs">
                                    {city.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Row 5: Image and Terms */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
                                placeholder="Upload image or enter URL"
                                maxSizeInMB={5}
                                allowCamera={true}
                                showPreview={true}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="termsAndConditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Terms & Conditions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter specific terms (optional)"
                                className="min-h-[60px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Agreement */}
                    <FormField
                      control={form.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm">
                              I agree to Instoredealz Terms and Conditions *
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createDealMutation.isPending}
                      >
                        {createDealMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Deal
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Deals Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6">
            {deals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Target className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No deals yet</h3>
                  <p className="text-gray-600 text-center max-w-md mb-6">
                    Create your first deal to start attracting customers to your business.
                  </p>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Deal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map((deal) => (
                  <Card key={deal.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{deal.title}</CardTitle>
                        <Badge variant={deal.approved ? "default" : "secondary"}>
                          {deal.approved ? "Active" : "Pending"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-3">{deal.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-green-600">
                          {deal.discountPercentage}% OFF
                        </span>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingDeal(deal);
                              setIsEditOpen(true);
                            }}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setViewingDeal(deal)}
                            className="hover:bg-green-50 hover:border-green-300"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* View Deal Dialog */}
        {viewingDeal && (
          <Dialog open={!!viewingDeal} onOpenChange={() => setViewingDeal(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Deal Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{viewingDeal.title}</h3>
                  <Badge variant={viewingDeal.approved ? "default" : "secondary"} className="mt-1">
                    {viewingDeal.approved ? "Approved" : "Pending"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-sm">{viewingDeal.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Discount</label>
                    <p className="text-sm font-bold text-green-600">{viewingDeal.discountPercentage}% OFF</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">PIN</label>
                    <p className="text-sm font-mono">{viewingDeal.verificationPin}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Valid Until</label>
                    <p className="text-sm">{new Date(viewingDeal.validUntil).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm mt-1">{viewingDeal.description}</p>
                </div>
                
                {viewingDeal.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-sm mt-1">{viewingDeal.address}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setViewingDeal(null)}>
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      setEditingDeal(viewingDeal);
                      setViewingDeal(null);
                      setIsEditOpen(true);
                    }}
                  >
                    Edit Deal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}