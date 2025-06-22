import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  MapPin,
  Clock,
  Store,
  Eye,
  EyeOff,
  Shield,
  Copy,
  Crown,
  Zap,
  Lock,
  ArrowLeft,
  Calendar,
  Tag,
  Percent,
  Users,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";

interface Deal {
  id: number;
  title: string;
  description: string;
  category: string;
  originalPrice: string;
  discountedPrice: string;
  discountPercentage: number;
  discountCode: string;
  validUntil: string;
  isActive: boolean;
  isApproved: boolean;
  requiredMembership: string;
  maxRedemptions?: number;
  currentRedemptions?: number;
  viewCount?: number;
  imageUrl?: string;
  vendor?: {
    id: number;
    businessName: string;
    city: string;
    address: string;
  };
}

interface DiscountCodeResponse {
  discountCode: string;
  requiresClick: boolean;
  membershipTier: string;
  category: string;
}

interface DiscountError {
  message: string;
  requiresUpgrade: boolean;
  currentTier: string;
  suggestedTier: string;
}

const membershipColors = {
  basic: "bg-gray-100 text-gray-800",
  premium: "bg-blue-100 text-blue-800",
  ultimate: "bg-purple-100 text-purple-800",
};

const categoryColors = {
  electronics: "bg-blue-100 text-blue-800",
  fashion: "bg-pink-100 text-pink-800",
  food: "bg-green-100 text-green-800",
  restaurants: "bg-orange-100 text-orange-800",
  travel: "bg-indigo-100 text-indigo-800",
  health: "bg-red-100 text-red-800",
  education: "bg-yellow-100 text-yellow-800",
  entertainment: "bg-purple-100 text-purple-800",
};

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [discountCode, setDiscountCode] = useState<string>("");
  const [showCode, setShowCode] = useState(false);
  const [codeRevealed, setCodeRevealed] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch deal details (public endpoint)
  const { data: deal, isLoading } = useQuery<Deal>({
    queryKey: [`/api/deals/${id}`],
    enabled: !!id,
  });

  // Check if deal is in wishlist
  const { data: wishlistCheck } = useQuery<{ inWishlist: boolean }>({
    queryKey: [`/api/wishlist/check/${id}`],
    enabled: !!id && isAuthenticated,
  });

  // Try to fetch secure deal details with membership verification
  const { data: secureDeal, error: secureError } = useQuery<Deal & { hasAccess: boolean; membershipTier: string }>({
    queryKey: [`/api/deals/${id}/secure`],
    enabled: !!id && isAuthenticated,
    retry: false,
  });

  // Check membership access error
  const membershipError = secureError && 'response' in secureError 
    ? (secureError as any).response?.data as DiscountError 
    : null;

  useEffect(() => {
    if (wishlistCheck?.inWishlist) {
      setIsFavorite(true);
    }
  }, [wishlistCheck]);

  // Increment view count when component mounts
  useEffect(() => {
    if (deal && id) {
      apiRequest(`/api/deals/${id}/view`, "POST", {}).catch(() => {
        // Silently fail view tracking
      });
    }
  }, [deal, id]);

  // Get discount code mutation - secure endpoint
  const getDiscountCodeMutation = useMutation({
    mutationFn: async (dealId: number) => {
      return await apiRequest(`/api/deals/${dealId}/discount-code`, "GET") as unknown as DiscountCodeResponse;
    },
    onSuccess: (data) => {
      setDiscountCode(data.discountCode);
      
      // Auto-reveal if not restricted by tier
      if (!data.requiresClick) {
        setShowCode(true);
        setCodeRevealed(true);
      }
      
      toast({
        title: "Discount Code Retrieved",
        description: data.requiresClick 
          ? "Click 'Reveal Code' to view your discount"
          : "Your discount code is ready to use!",
      });
    },
    onError: (error: any) => {
      let errorData: DiscountError | null = null;
      
      try {
        if (error.message && error.message.includes('403')) {
          const jsonStart = error.message.indexOf('{');
          if (jsonStart !== -1) {
            errorData = JSON.parse(error.message.substring(jsonStart));
          }
        }
      } catch (e) {
        // Fallback error handling
      }
        
      if (errorData?.requiresUpgrade) {
        toast({
          title: "Upgrade Required",
          description: `${errorData.message}. You're currently on ${errorData.currentTier} plan.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Access Denied",
          description: "Unable to retrieve discount code",
          variant: "destructive",
        });
      }
    },
  });

  // Claim deal mutation
  const claimDealMutation = useMutation({
    mutationFn: async (dealId: number) => {
      return await apiRequest(`/api/deals/${dealId}/claim`, "POST", {});
    },
    onSuccess: () => {
      toast({
        title: "Deal Claimed Successfully!",
        description: "Your discount has been saved to your account. You can claim this deal multiple times.",
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/claims"] });
    },
    onError: (error: any) => {
      toast({
        title: "Claim Failed",
        description: error.message || "Unable to claim this deal",
        variant: "destructive",
      });
    },
  });

  // Wishlist mutations
  const addToWishlistMutation = useMutation({
    mutationFn: async (dealId: number) => {
      return await apiRequest("/api/wishlist", "POST", { dealId });
    },
    onSuccess: () => {
      setIsFavorite(true);
      toast({
        title: "Added to Wishlist",
        description: "Deal saved to your wishlist",
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (dealId: number) => {
      return await apiRequest(`/api/wishlist/${dealId}`, "DELETE");
    },
    onSuccess: () => {
      setIsFavorite(false);
      toast({
        title: "Removed from Wishlist",
        description: "Deal removed from your wishlist",
      });
    },
  });

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add deals to wishlist",
        variant: "destructive",
      });
      return;
    }

    if (isFavorite) {
      removeFromWishlistMutation.mutate(deal!.id);
    } else {
      addToWishlistMutation.mutate(deal!.id);
    }
  };

  const handleClaimDeal = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to claim deals",
        variant: "destructive",
      });
      return;
    }
    
    claimDealMutation.mutate(deal!.id);
  };

  const handleGetDiscountCode = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to access discount codes",
        variant: "destructive",
      });
      return;
    }
    
    getDiscountCodeMutation.mutate(deal!.id);
  };

  const handleRevealCode = () => {
    setShowCode(true);
    setCodeRevealed(true);
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied!",
        description: "Discount code copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  const canAccessDeal = () => {
    if (!user || !deal) return false;
    
    const membershipLevels = { basic: 1, premium: 2, ultimate: 3 };
    const userLevel = membershipLevels[user.membershipPlan as keyof typeof membershipLevels] || 1;
    const requiredLevel = membershipLevels[deal.requiredMembership as keyof typeof membershipLevels] || 1;
    
    return userLevel >= requiredLevel;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>Loading deal details...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Deal Not Found</h2>
            <p className="text-gray-600 mb-4">The deal you're looking for doesn't exist.</p>
            <Link href="/customer/deals">
              <Button>Back to Deals</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(deal.validUntil) < new Date();
  const isFullyRedeemed = deal.maxRedemptions && (deal.currentRedemptions || 0) >= deal.maxRedemptions;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deals
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Deal Image */}
          <div className="relative">
            <Card className="overflow-hidden">
              {deal.imageUrl ? (
                <img
                  src={deal.imageUrl}
                  alt={deal.title}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Store className="w-24 h-24 text-gray-400" />
                </div>
              )}
              
              {/* Discount overlay */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-red-500 text-white text-xl font-bold px-4 py-2">
                  {deal.discountPercentage}% OFF
                </Badge>
              </div>

              {/* Favorite button */}
              <button
                onClick={handleToggleFavorite}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200"
              >
                <Heart 
                  className={`h-5 w-5 transition-colors duration-200 ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
                  }`} 
                />
              </button>
            </Card>
          </div>

          {/* Deal Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{deal.title}</CardTitle>
                    <p className="text-gray-600 mb-4">{deal.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={categoryColors[deal.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800"}>
                        {deal.category}
                      </Badge>
                      <Badge className={membershipColors[deal.requiredMembership as keyof typeof membershipColors]}>
                        {deal.requiredMembership}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Discount Info */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-600">{deal.discountPercentage}% OFF</span>
                    <span className="text-sm text-gray-600">on total bill</span>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    Subscription Discount
                  </Badge>
                </div>

                <Separator />

                {/* Deal Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Valid until {formatDate(deal.validUntil)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span>{deal.viewCount || 0} views</span>
                  </div>
                  {deal.maxRedemptions && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{deal.currentRedemptions || 0}/{deal.maxRedemptions} claimed</span>
                    </div>
                  )}
                </div>

                {/* Vendor Info */}
                {deal.vendor && (
                  <>
                    <Separator />
                    <div className="flex items-center space-x-3">
                      <Store className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{deal.vendor.businessName}</p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {deal.vendor.city}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-4">
                  {/* Claim Deal Button */}
                  <Button
                    onClick={handleClaimDeal}
                    disabled={claimDealMutation.isPending || isExpired || !!isFullyRedeemed || !canAccessDeal()}
                    className="w-full"
                    size="lg"
                  >
                    {claimDealMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Claiming Deal...
                      </>
                    ) : isExpired ? (
                      "Deal Expired"
                    ) : isFullyRedeemed ? (
                      "Fully Redeemed"
                    ) : !canAccessDeal() ? (
                      "Upgrade Required"
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Claim Deal
                      </>
                    )}
                  </Button>

                  {/* Discount Code Section */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Discount Code
                    </h3>
                    
                    {!isAuthenticated ? (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">Login to access discount codes</p>
                        <Button size="sm" variant="outline" onClick={() => setLocation("/login")}>
                          Login Required
                        </Button>
                      </div>
                    ) : membershipError?.requiresUpgrade ? (
                      <div className="text-center p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                        <Crown className="w-12 h-12 mx-auto mb-3 text-red-600" />
                        <h4 className="font-semibold text-lg text-gray-900 mb-2">Upgrade Required</h4>
                        <p className="text-sm text-gray-700 mb-2">
                          {membershipError.message}
                        </p>
                        <div className="bg-white/50 rounded-md p-3 mb-4">
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Current Plan:</span> {membershipError.currentTier} 
                            <span className="mx-2">→</span> 
                            <span className="font-medium">Suggested:</span> {membershipError.suggestedTier}
                          </p>
                        </div>
                        <Button 
                          size="lg" 
                          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                          onClick={() => setLocation('/customer/upgrade')}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Upgrade Your Plan
                        </Button>
                      </div>
                    ) : !canAccessDeal() ? (
                      <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                        <p className="text-sm text-gray-700 mb-2">
                          Upgrade to access this deal
                        </p>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                          onClick={() => setLocation('/customer/upgrade')}
                        >
                          <Zap className="w-4 h-4 mr-1" />
                          Upgrade Plan
                        </Button>
                      </div>
                    ) : !discountCode ? (
                      <Button
                        onClick={handleGetDiscountCode}
                        disabled={getDiscountCodeMutation.isPending || isExpired || !!isFullyRedeemed}
                        className="w-full"
                        size="lg"
                        variant="outline"
                      >
                        {getDiscountCodeMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Getting Code...
                          </>
                        ) : isExpired ? (
                          "Deal Expired"
                        ) : isFullyRedeemed ? (
                          "Fully Redeemed"
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Get Discount Code
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        {!showCode ? (
                          <Button
                            onClick={handleRevealCode}
                            className="w-full"
                            size="lg"
                            variant="outline"
                          >
                            <EyeOff className="w-4 h-4 mr-2" />
                            Click to Reveal Code
                          </Button>
                        ) : (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-green-700 mb-1">Your Discount Code:</p>
                                <div className="flex items-center space-x-2">
                                  <code className="text-lg font-mono font-bold text-green-800 bg-white px-3 py-2 rounded border">
                                    {discountCode}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(discountCode)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                                <p className="text-xs text-green-600 mt-2">
                                  Present this code at checkout to get your discount
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}