import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Loader2, 
  Store, 
  Plus, 
  CheckCircle, 
  Building, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Calendar, 
  Tag, 
  DollarSign, 
  Percent,
  Sparkles,
  Rocket,
  Trophy,
  Target,
  Gift,
  Crown,
  Star,
  Zap
} from 'lucide-react';
import ImageUpload from '@/components/ui/image-upload';

// Vendor registration validation schema
const vendorRegistrationSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  businessType: z.string().min(1, 'Please select a business type'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  gstNumber: z.string().optional(),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format').optional().or(z.literal('')),
});

// Deal creation validation schema
const dealCreationSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Please select a category'),
  subcategory: z.string().optional(),
  originalPrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a valid positive number'),
  discountedPrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a valid positive number'),
  validUntil: z.string().min(1, 'Expiry date is required'),
  maxRedemptions: z.string().optional(),
  terms: z.string().min(10, 'Terms and conditions are required'),
  requiredMembership: z.string().min(1, 'Please select required membership'),
  imageUrl: z.string().optional(),
}).refine((data) => Number(data.discountedPrice) < Number(data.originalPrice), {
  message: "Discounted price must be less than original price",
  path: ["discountedPrice"],
});

// Form types will be inferred from Zod schemas

// Constants
const BUSINESS_TYPES = [
  'Restaurant', 'Retail Store', 'Fashion & Apparel', 'Electronics', 'Home & Garden',
  'Health & Beauty', 'Sports & Fitness', 'Travel & Tourism', 'Education', 'Healthcare',
  'Automotive', 'Entertainment', 'Professional Services', 'Other'
];

const DEAL_CATEGORIES = [
  { value: 'restaurants', label: '🍽️ Restaurants' },
  { value: 'fashion', label: '👗 Fashion' },
  { value: 'electronics', label: '📱 Electronics' },
  { value: 'travel', label: '✈️ Travel' },
  { value: 'health', label: '💊 Health' },
  { value: 'education', label: '📚 Education' },
  { value: 'home-garden', label: '🏠 Home & Garden' },
  { value: 'sports', label: '⚽ Sports' },
  { value: 'entertainment', label: '🎬 Entertainment' },
  { value: 'automotive', label: '🚗 Automotive' },
  { value: 'beauty', label: '💄 Beauty' },
  { value: 'services', label: '🔧 Services' },
  { value: 'other', label: '🔄 Other' }
];

// Services subcategories structure
const SERVICES_SUBCATEGORIES = {
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

const MEMBERSHIP_LEVELS = [
  { value: 'basic', label: '🆓 Basic (Free Users)', description: 'Available to all users' },
  { value: 'premium', label: '⭐ Premium Members', description: 'Requires ₹500 subscription' },
  { value: 'ultimate', label: '👑 Ultimate Members', description: 'Requires ₹1000 subscription' }
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

const VendorPortal = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [dealSuccess, setDealSuccess] = useState(false);
  const [vendorResult, setVendorResult] = useState(null);
  const [dealResult, setDealResult] = useState(null);
  const [showSubcategory, setShowSubcategory] = useState(false);
  
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Vendor registration form
  const vendorForm = useForm({
    resolver: zodResolver(vendorRegistrationSchema),
    defaultValues: {
      businessName: '',
      ownerName: '',
      email: user?.email || '',
      phone: '',
      businessType: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      website: '',
      description: '',
      gstNumber: '',
      panNumber: '',
    }
  });

  // Deal creation form
  const dealForm = useForm({
    resolver: zodResolver(dealCreationSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      subcategory: '',
      originalPrice: '',
      discountedPrice: '',
      validUntil: '',
      maxRedemptions: '',
      terms: '',
      requiredMembership: 'basic',
      imageUrl: '',
    }
  });

  // Watch category to show/hide subcategory field
  const watchedCategory = dealForm.watch('category');
  
  // Show subcategory field when "services" is selected
  React.useEffect(() => {
    setShowSubcategory(watchedCategory === 'services');
    if (watchedCategory !== 'services') {
      dealForm.setValue('subcategory', '');
    }
  }, [watchedCategory, dealForm]);

  // Calculate discount percentage automatically
  const watchOriginalPrice = dealForm.watch('originalPrice');
  const watchDiscountedPrice = dealForm.watch('discountedPrice');
  
  const discountPercentage = watchOriginalPrice && watchDiscountedPrice 
    ? Math.round(((Number(watchOriginalPrice) - Number(watchDiscountedPrice)) / Number(watchOriginalPrice)) * 100)
    : 0;

  // External API call for vendor registration using magic API
  const callExternalVendorAPI = async (vendorData) => {
    try {
      const externalResponse = await apiRequest('/api/magic/companies/vendor', 'POST', {
        companyName: vendorData.businessName,
        ownerName: vendorData.ownerName,
        email: vendorData.email,
        phone: vendorData.phone,
        businessType: vendorData.businessType,
        address: vendorData.address,
        city: vendorData.city,
        state: vendorData.state,
        pincode: vendorData.pincode,
        website: vendorData.website,
        description: vendorData.description,
        gstNumber: vendorData.gstNumber,
        panNumber: vendorData.panNumber,
        registeredAt: new Date().toISOString()
      });

      console.log('External vendor API call successful');
      return externalResponse;
    } catch (error) {
      console.warn('External vendor API call error:', error.message);
      return null;
    }
  };

  // External API call for deal creation using magic API
  const callExternalDealAPI = async (dealData, vendorId) => {
    try {
      const externalResponse = await apiRequest('/api/magic/deals/vendor', 'POST', {
        vendorId: vendorId,
        title: dealData.title,
        description: dealData.description,
        category: dealData.category,
        originalPrice: Number(dealData.originalPrice),
        discountedPrice: Number(dealData.discountedPrice),
        discountPercentage: discountPercentage,
        validUntil: dealData.validUntil,
        maxRedemptions: dealData.maxRedemptions ? Number(dealData.maxRedemptions) : null,
        requiredMembership: dealData.requiredMembership,
        createdAt: new Date().toISOString()
      });

      console.log('External deal API call successful');
      return externalResponse;
    } catch (error) {
      console.warn('External deal API call error:', error.message);
      return null;
    }
  };

  // Vendor subscription mutation
  const vendorSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionData) => {
      const response = await apiRequest('/api/vendor-subscription', 'POST', subscriptionData);
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Vendor Subscription Activated! 🎉",
        description: "Your vendor subscription is now active with enhanced features.",
        variant: "default",
      });
      
      // Call external vendor subscription API
      callExternalVendorSubscriptionAPI(data);
    },
    onError: (error) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to activate vendor subscription.",
        variant: "destructive",
      });
    },
  });

  // External vendor subscription API call
  const callExternalVendorSubscriptionAPI = async (subscriptionData) => {
    try {
      await apiRequest('/api/magic/vendor-subscription', 'POST', {
        vendorId: user?.id,
        subscriptionId: subscriptionData.subscriptionId,
        planType: 'vendor_premium',
        amount: subscriptionData.amount,
        currency: 'INR',
        activatedAt: new Date().toISOString(),
        expiryDate: subscriptionData.expiryDate
      });
    } catch (error) {
      console.warn('External vendor subscription API error:', error.message);
    }
  };

  // Initialize Razorpay for vendor subscription
  const handleVendorSubscription = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to vendor features.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Initialize Razorpay
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1234567890',
          amount: 150000, // ₹1500 for vendor subscription
          currency: 'INR',
          name: 'Instoredealz Vendor Premium',
          description: 'Vendor Premium Subscription - Enhanced Tools',
          handler: async (response) => {
            try {
              await vendorSubscriptionMutation.mutateAsync({
                planId: 'vendor_premium',
                paymentId: response.razorpay_payment_id,
                amount: 1500,
                userId: user?.id,
              });
            } catch (error) {
              console.error('Vendor subscription failed:', error);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
          },
          theme: {
            color: '#8B5CF6',
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
      document.body.appendChild(script);
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Vendor registration mutation
  const registerVendorMutation = useMutation({
    mutationFn: async (vendorData) => {
      const response = await apiRequest('/api/register-vendor', 'POST', vendorData);
      return response;
    },
    onSuccess: (data) => {
      setVendorResult(data);
      setRegistrationSuccess(true);
      vendorForm.reset();
      
      // Call external API
      callExternalVendorAPI(vendorForm.getValues());
      
      toast({
        title: "Vendor Registration Successful! 🎉",
        description: "Your vendor profile has been submitted for approval.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register vendor. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Deal creation mutation
  const createDealMutation = useMutation({
    mutationFn: async (dealData) => {
      const response = await apiRequest('/api/create-deal', 'POST', dealData);
      return response;
    },
    onSuccess: (data) => {
      setDealResult(data);
      setDealSuccess(true);
      dealForm.reset();
      
      // Call external API
      callExternalDealAPI(dealForm.getValues(), data.vendorId);
      
      toast({
        title: "Deal Created Successfully! 🚀",
        description: "Your deal has been submitted for approval.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Deal Creation Failed",
        description: error.message || "Failed to create deal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle vendor registration
  const onVendorSubmit = async (data) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register as a vendor.",
        variant: "destructive",
      });
      return;
    }
    
    await registerVendorMutation.mutateAsync(data);
  };

  // Handle deal creation
  const onDealSubmit = async (data) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create deals.",
        variant: "destructive",
      });
      return;
    }
    
    const dealDataWithPercentage = {
      ...data,
      discountPercentage
    };
    
    await createDealMutation.mutateAsync(dealDataWithPercentage);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <Store className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Vendor Portal
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Join our marketplace and start selling amazing deals to customers!
          </p>
        </div>

        {/* Vendor Portal Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="register" className="text-lg py-3">
              <Building className="h-5 w-5 mr-2" />
              Register as Vendor
            </TabsTrigger>
            <TabsTrigger value="create-deal" className="text-lg py-3">
              <Plus className="h-5 w-5 mr-2" />
              Create Deal
            </TabsTrigger>

          </TabsList>

          {/* Vendor Registration Tab */}
          <TabsContent value="register">
            <Card className="border-2 border-dashed border-blue-300 dark:border-blue-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                  <Rocket className="h-6 w-6 text-blue-500" />
                  <span>Start Your Vendor Journey</span>
                </CardTitle>
                <CardDescription className="text-base">
                  Fill out the form below to join our marketplace and start offering deals to customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...vendorForm}>
                  <form onSubmit={vendorForm.handleSubmit(onVendorSubmit)} className="space-y-6">
                    {/* Business Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Building className="h-5 w-5 mr-2" />
                        Business Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={vendorForm.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your business name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={vendorForm.control}
                          name="ownerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Owner Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter owner's full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={vendorForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="business@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={vendorForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input placeholder="+91 9876543210" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={vendorForm.control}
                        name="businessType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your business type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {BUSINESS_TYPES.map((type) => (
                                  <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Location Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Location Information
                      </h3>
                      
                      <FormField
                        control={vendorForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Address *</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter complete business address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={vendorForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter city" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={vendorForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {INDIAN_STATES.map((state) => (
                                    <SelectItem key={state} value={state}>
                                      {state}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={vendorForm.control}
                          name="pincode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pincode *</FormLabel>
                              <FormControl>
                                <Input placeholder="123456" maxLength={6} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Additional Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Globe className="h-5 w-5 mr-2" />
                        Additional Information
                      </h3>
                      
                      <FormField
                        control={vendorForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://www.yourbusiness.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Optional: Your business website URL
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={vendorForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your business, products, and services in detail..."
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Provide a detailed description of your business (minimum 20 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={vendorForm.control}
                          name="gstNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GST Number</FormLabel>
                              <FormControl>
                                <Input placeholder="GST registration number" {...field} />
                              </FormControl>
                              <FormDescription>
                                Optional: 15-digit GST number
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={vendorForm.control}
                          name="panNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PAN Number</FormLabel>
                              <FormControl>
                                <Input placeholder="ABCDE1234F" style={{ textTransform: 'uppercase' }} {...field} />
                              </FormControl>
                              <FormDescription>
                                Optional: 10-character PAN number
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={!isAuthenticated || registerVendorMutation.isPending}
                      className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transform transition-all duration-300 hover:scale-105"
                      size="lg"
                    >
                      {registerVendorMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Registering Vendor...
                        </>
                      ) : (
                        <>
                          <Store className="h-5 w-5 mr-2" />
                          Register as Vendor
                        </>
                      )}
                    </Button>

                    {!isAuthenticated && (
                      <p className="text-center text-sm text-red-600 dark:text-red-400">
                        Please log in to register as a vendor
                      </p>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deal Creation Tab */}
          <TabsContent value="create-deal">
            <Card className="border-2 border-dashed border-purple-300 dark:border-purple-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                  <Target className="h-6 w-6 text-purple-500" />
                  <span>Create Amazing Deals</span>
                </CardTitle>
                <CardDescription className="text-base">
                  Design compelling deals that will attract customers to your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...dealForm}>
                  <form onSubmit={dealForm.handleSubmit(onDealSubmit)} className="space-y-6">
                    {/* Deal Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Gift className="h-5 w-5 mr-2" />
                        Deal Information
                      </h3>
                      
                      <FormField
                        control={dealForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deal Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 50% Off on All Products" {...field} />
                            </FormControl>
                            <FormDescription>
                              Create an eye-catching title for your deal
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={dealForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your deal in detail - what's included, any conditions, how to redeem..."
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Provide detailed information about your deal (minimum 20 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={dealForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deal Image</FormLabel>
                            <FormControl>
                              <div className="space-y-4">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      // For now, we'll use a simple file reader to convert to base64
                                      // In production, you'd want to upload to a cloud service
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        field.onChange(event.target.result);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="cursor-pointer"
                                />
                                {field.value && (
                                  <div className="mt-2">
                                    <img 
                                      src={field.value} 
                                      alt="Deal preview" 
                                      className="max-w-xs max-h-48 object-cover rounded-lg border border-gray-300"
                                    />
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormDescription>
                              Upload an attractive image for your deal (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={dealForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setShowSubcategory(value === 'services');
                                if (value !== 'services') {
                                  dealForm.setValue('subcategory', '');
                                }
                              }} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select deal category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DEAL_CATEGORIES.map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {showSubcategory && (
                        <FormField
                          control={dealForm.control}
                          name="subcategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select service type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(SERVICES_SUBCATEGORIES).map(([key, category]) => (
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
                    </div>

                    {/* Pricing Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Pricing Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={dealForm.control}
                          name="originalPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Original Price (₹) *</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="1000" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={dealForm.control}
                          name="discountedPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discounted Price (₹) *</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="500" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {discountPercentage > 0 && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center space-x-2">
                            <Percent className="h-5 w-5 text-green-600" />
                            <span className="text-lg font-semibold text-green-700 dark:text-green-400">
                              Discount: {discountPercentage}% OFF
                            </span>
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Customers save ₹{Number(watchOriginalPrice || 0) - Number(watchDiscountedPrice || 0)} with this deal!
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Deal Settings Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Deal Settings
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={dealForm.control}
                          name="validUntil"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valid Until *</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                              <FormDescription>
                                When does this deal expire?
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={dealForm.control}
                          name="maxRedemptions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Redemptions</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="100" min="1" {...field} />
                              </FormControl>
                              <FormDescription>
                                Optional: Limit number of claims
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={dealForm.control}
                        name="requiredMembership"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Required Membership *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select required membership level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {MEMBERSHIP_LEVELS.map((level) => (
                                  <SelectItem key={level.value} value={level.value}>
                                    <div className="flex flex-col">
                                      <span>{level.label}</span>
                                      <span className="text-xs text-gray-500">{level.description}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Choose who can access this deal
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={dealForm.control}
                        name="terms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Terms & Conditions *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter terms and conditions for this deal..."
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Specify important terms, conditions, and restrictions
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={!isAuthenticated || createDealMutation.isPending}
                      className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transform transition-all duration-300 hover:scale-105"
                      size="lg"
                    >
                      {createDealMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Creating Deal...
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5 mr-2" />
                          Create Deal
                        </>
                      )}
                    </Button>

                    {!isAuthenticated && (
                      <p className="text-center text-sm text-red-600 dark:text-red-400">
                        Please log in to create deals
                      </p>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendor Subscription Tab */}
          <TabsContent value="subscription">
            <Card className="border-2 border-dashed border-yellow-300 dark:border-yellow-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  <span>Vendor Premium Subscription</span>
                </CardTitle>
                <CardDescription className="text-base">
                  Unlock advanced vendor tools and priority support for your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Subscription Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Star className="h-5 w-5 mr-2 text-yellow-500" />
                        Premium Features
                      </h3>
                      
                      <div className="space-y-3">
                        {[
                          "⚡ Priority Deal Approval",
                          "📊 Advanced Analytics Dashboard", 
                          "🎯 Featured Deal Placement",
                          "📞 Dedicated Support Channel",
                          "💼 Business Growth Tools",
                          "🔔 Real-time Notifications"
                        ].map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-blue-500" />
                        Enhanced Capabilities
                      </h3>
                      
                      <div className="space-y-3">
                        {[
                          "🚀 Unlimited Deal Creation",
                          "📈 Performance Insights", 
                          "🎨 Custom Branding Options",
                          "📱 Mobile App Access",
                          "🔗 API Integration Access",
                          "🏆 Success Manager Support"
                        ].map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">₹1,500</span>
                        <span className="text-gray-600 dark:text-gray-400">/month</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Unlock premium vendor features and grow your business faster
                      </p>
                    </div>
                  </div>

                  {/* Subscribe Button */}
                  <Button
                    onClick={handleVendorSubscription}
                    disabled={!isAuthenticated || vendorSubscriptionMutation.isPending}
                    className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white transform transition-all duration-300 hover:scale-105"
                    size="lg"
                  >
                    {vendorSubscriptionMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Crown className="h-5 w-5 mr-2" />
                        Subscribe to Premium
                      </>
                    )}
                  </Button>

                  {!isAuthenticated && (
                    <p className="text-center text-sm text-red-600 dark:text-red-400">
                      Please log in to subscribe to vendor premium features
                    </p>
                  )}

                  {/* Security Badge */}
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-4">
                    <span>🔒 Secure Payment by Razorpay</span>
                    <span>•</span>
                    <span>Cancel anytime</span>
                    <span>•</span>
                    <span>24/7 Support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Success Dialogs */}
        <Dialog open={registrationSuccess} onOpenChange={setRegistrationSuccess}>
          <DialogContent className="sm:max-w-md text-center">
            <DialogHeader>
              <DialogTitle className="text-center text-green-600 flex items-center justify-center space-x-2">
                <Trophy className="h-6 w-6" />
                <span>Vendor Registration Successful!</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex flex-col items-center space-y-4 py-6">
              <div className="text-6xl animate-bounce">🎉</div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                  Welcome to the Marketplace!
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Your vendor profile has been submitted for approval by our admin team.
                </p>
                
                {vendorResult && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                    <p>Business: {vendorResult.businessName}</p>
                    <p>Status: {vendorResult.status}</p>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={() => setRegistrationSuccess(false)} 
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Continue to Deal Creation
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={dealSuccess} onOpenChange={setDealSuccess}>
          <DialogContent className="sm:max-w-md text-center">
            <DialogHeader>
              <DialogTitle className="text-center text-purple-600 flex items-center justify-center space-x-2">
                <Gift className="h-6 w-6" />
                <span>Deal Created Successfully!</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex flex-col items-center space-y-4 py-6">
              <div className="text-6xl animate-bounce">🚀</div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
                  Your Deal is Live!
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Your deal has been submitted for approval and will be visible to customers soon.
                </p>
                
                {dealResult && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                    <p>Deal: {dealResult.title}</p>
                    <p>Status: {dealResult.status}</p>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={() => setDealSuccess(false)} 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Target className="h-4 w-4 mr-2" />
                Create Another Deal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VendorPortal;