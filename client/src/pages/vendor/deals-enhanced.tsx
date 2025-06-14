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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { majorCities } from "@/lib/cities";
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
  Camera,
  Image,
  Upload,
  MapPin,
  Percent,
  FileText,
  CheckCircle
} from "lucide-react";

// Business categories
const businessCategories = [
  { id: "fashion", name: "Fashion & Clothing" },
  { id: "electronics", name: "Electronics & Technology" },
  { id: "food", name: "Food & Dining" },
  { id: "home", name: "Home & Garden" },
  { id: "beauty", name: "Health & Beauty" },
  { id: "travel", name: "Travel & Tourism" },
  { id: "entertainment", name: "Entertainment" },
  { id: "sports", name: "Sports & Fitness" },
  { id: "automotive", name: "Automotive" },
  { id: "services", name: "Professional Services" },
];

const dealSchema = z.object({
  title: z.string().min(5, "Deal title must be at least 5 characters"),
  description: z.string().min(10, "Deal description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  discountCode: z.string().min(3, "Discount code must be at least 3 characters"),
  discountPercentage: z.number().min(1, "Discount must be at least 1%").max(90, "Discount cannot exceed 90%"),
  dealAvailability: z.enum(["all-stores", "selected-locations"]),
  selectedCities: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  validUntil: z.string().min(1, "Please select validity date"),
  termsAndConditions: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms and conditions"),
}).refine((data) => {
  if (data.dealAvailability === "selected-locations" && (!data.selectedCities || data.selectedCities.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Please select at least one city for selected locations",
  path: ["selectedCities"],
});

type DealForm = z.infer<typeof dealSchema>;

export default function VendorDealsEnhanced() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<DealForm>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      discountCode: "",
      discountPercentage: 10,
      dealAvailability: "all-stores",
      selectedCities: [],
      imageUrl: "",
      validUntil: "",
      termsAndConditions: "",
      agreeToTerms: false,
    },
  });

  const { data: deals, isLoading } = useQuery({
    queryKey: ["/api/vendors/deals"],
  });

  const createDealMutation = useMutation({
    mutationFn: async (data: DealForm) => {
      const payload = {
        ...data,
        selectedCities: data.dealAvailability === "all-stores" ? null : data.selectedCities,
      };
      return apiRequest('POST', '/api/vendors/deals', payload);
    },
    onSuccess: () => {
      toast({
        title: "Deal submitted for approval!",
        description: "Your deal will be reviewed and published once approved.",
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

  const onSubmit = (data: DealForm) => {
    createDealMutation.mutate(data);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      // In a real app, you would upload this to a storage service
      // For now, we'll create a placeholder URL
      const placeholderUrl = `https://via.placeholder.com/600x400/007bff/ffffff?text=${encodeURIComponent(form.getValues('title') || 'Deal')}`;
      form.setValue('imageUrl', placeholderUrl);
    }
  };

  const selectedAvailability = form.watch("dealAvailability");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Deals</h1>
            <p className="text-gray-600 mt-1">
              Create and manage your business deals and offers
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Basic Deal Information */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Deal Information
                    </h3>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deal Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter deal title (e.g., Summer Sale - 50% Off)" {...field} />
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
                            <FormLabel>Deal Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your deal in detail - what's included, any restrictions, etc."
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
                          name="discountCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount Code *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter discount code (e.g., SAVE50)" {...field} />
                              </FormControl>
                              <FormDescription>
                                Unique code customers will use to claim the deal
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="discountPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Percentage *</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="90"
                                  placeholder="Enter discount percentage"
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
                  </div>

                  {/* Deal Availability */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Deal Availability
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="dealAvailability"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Where is this deal available? *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all-stores" id="all-stores" />
                                <label htmlFor="all-stores" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  All Stores - Available everywhere
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="selected-locations" id="selected-locations" />
                                <label htmlFor="selected-locations" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Selected Locations Only
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedAvailability === "selected-locations" && (
                      <FormField
                        control={form.control}
                        name="selectedCities"
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Select Cities *</FormLabel>
                            <FormDescription>
                              Choose the cities where this deal will be available
                            </FormDescription>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded p-3">
                              {majorCities.map((city) => (
                                <div key={city.name} className="flex items-center space-x-2">
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
                                  <label htmlFor={city.name} className="text-sm">
                                    {city.name}, {city.state}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Deal Image Upload */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Image className="h-5 w-5 mr-2" />
                      Deal Image
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="deal-image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> deal image
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 1200x800px)</p>
                          </div>
                          <input 
                            id="deal-image-upload" 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                      
                      {imageFile && (
                        <div className="text-sm text-green-600">
                          Image uploaded: {imageFile.name}
                        </div>
                      )}

                      <div className="flex items-center space-x-4">
                        <Button type="button" variant="outline" size="sm" className="flex items-center">
                          <Image className="h-4 w-4 mr-2" />
                          Upload from Gallery
                        </Button>
                        <Button type="button" variant="outline" size="sm" className="flex items-center">
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo with Camera
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Validity and Terms */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Validity & Terms
                    </h3>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="validUntil"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Validity *</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                min={new Date().toISOString().split('T')[0]}
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Select the last date when this deal will be valid
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="termsAndConditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Any Specific Terms and Conditions for this Deal</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter any specific terms, restrictions, or conditions for this deal (optional)"
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Include any specific conditions, minimum purchase requirements, exclusions, etc.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Agreement */}
                  <div className="border rounded-lg p-6">
                    <FormField
                      control={form.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I Agree to Instoredealz Terms and Conditions *
                            </FormLabel>
                            <FormDescription>
                              By checking this box, you agree to our platform terms and deal posting guidelines.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormMessage />
                  </div>

                  <div className="flex justify-end space-x-4">
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
                      Submit Deal for Approval
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Deals Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6">
            {deals?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Target className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No deals yet</h3>
                  <p className="text-gray-600 text-center max-w-md mb-6">
                    Start creating deals to attract customers and grow your business. Your deals will be reviewed before going live.
                  </p>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Deal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals?.map((deal: any) => (
                  <Card key={deal.id} className="overflow-hidden">
                    {deal.imageUrl && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={deal.imageUrl} 
                          alt={deal.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={deal.isApproved ? "default" : "secondary"}>
                          {deal.isApproved ? "Active" : "Pending Approval"}
                        </Badge>
                        <span className="text-sm font-medium text-green-600">
                          {deal.discountPercentage}% OFF
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {deal.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {deal.description}
                      </p>
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Valid until {new Date(deal.validUntil).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {deal.viewCount} views
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {deal.currentRedemptions} claimed
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}