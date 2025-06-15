import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import {
  Eye,
  EyeOff,
  Copy,
  Clock,
  MapPin,
  Store,
  Crown,
  Lock,
  Zap,
  Star,
  ShoppingBag,
  ExternalLink,
  Navigation
} from "lucide-react";

interface Deal {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  discountPercentage: number;
  originalPrice?: number;
  discountedPrice?: number;
  validUntil: string;
  maxRedemptions?: number;
  currentRedemptions: number;
  requiredMembership: string;
  vendor?: {
    businessName: string;
    city: string;
    rating: number;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
}

interface SecureDealCardProps {
  deal: Deal;
  className?: string;
  onClaim?: (dealId: number) => void;
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

export default function SecureDealCard({ deal, className = "", onClaim }: SecureDealCardProps) {
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [codeRevealed, setCodeRevealed] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get discount code mutation
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
      const errorData = error.message.includes('403') 
        ? JSON.parse(error.message.split('403: ')[1]) as DiscountError
        : null;
        
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

  // Copy code to clipboard
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

  // Handle discount code access
  const handleGetDiscountCode = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to access discount codes",
        variant: "destructive",
      });
      return;
    }
    
    getDiscountCodeMutation.mutate(deal.id);
  };

  // Handle reveal code click (for premium tier restricted categories)
  const handleRevealCode = () => {
    setShowCode(true);
    setCodeRevealed(true);
  };

  // Handle get directions
  const handleGetDirections = () => {
    if (!deal.vendor) return;
    
    const { businessName, city, address, latitude, longitude } = deal.vendor;
    
    // If we have coordinates, use them for precise location
    if (latitude && longitude) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      window.open(mapsUrl, '_blank');
    } else {
      // Fallback to address or business name + city
      const location = address ? `${address}, ${city}` : `${businessName}, ${city}`;
      const encodedLocation = encodeURIComponent(location);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
      window.open(mapsUrl, '_blank');
    }
  };

  // Get membership tier styling
  const getTierStyling = (tier: string) => {
    switch (tier) {
      case 'ultimate':
        return {
          badge: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: Crown,
          label: 'Ultimate'
        };
      case 'premium':
        return {
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Star,
          label: 'Premium'
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: ShoppingBag,
          label: 'Basic'
        };
    }
  };

  // Check if user can access this deal based on membership
  const canAccessDeal = () => {
    if (!user) return false;
    
    const userTier = user.membershipPlan || 'basic';
    const dealCategory = deal.category.toLowerCase();
    
    // Basic tier logic
    if (userTier === 'basic') {
      return ['restaurants', 'fashion', 'travel'].includes(dealCategory);
    }
    
    // Premium and Ultimate can access all deals
    return ['premium', 'ultimate'].includes(userTier);
  };

  const tierStyling = getTierStyling(user?.membershipPlan || 'basic');
  const TierIcon = tierStyling.icon;
  const isExpired = new Date(deal.validUntil) < new Date();
  const isFullyRedeemed = deal.maxRedemptions && deal.currentRedemptions && deal.currentRedemptions >= deal.maxRedemptions;

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}>
      {/* Membership tier indicator */}
      <div className="absolute top-3 right-3 z-10">
        <Badge className={`${tierStyling.badge} gap-1 text-xs`}>
          <TierIcon className="w-3 h-3" />
          {deal.requiredMembership.toUpperCase()}
        </Badge>
      </div>

      {/* Deal image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {deal.imageUrl ? (
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Discount percentage overlay */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-red-500 text-white text-lg font-bold px-3 py-1">
            {deal.discountPercentage}% OFF
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
            {deal.title}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {deal.description}
          </p>

          {/* Vendor info */}
          {deal.vendor && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Store className="w-4 h-4" />
              <span className="font-medium">{deal.vendor.businessName}</span>
              <MapPin className="w-3 h-3" />
              <span>{deal.vendor.city}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">


        {/* Validity and nearby deals info */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Valid until {new Date(deal.validUntil).toLocaleDateString()}</span>
          </div>
          {deal.vendor && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>1.8 km away</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Discount code section */}
        <div className="space-y-3">
          {!isAuthenticated ? (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">Login to access discount codes</p>
              <Button size="sm" variant="outline">
                Login Required
              </Button>
            </div>
          ) : !canAccessDeal() ? (
            <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-sm text-gray-700 mb-2">
                Upgrade to access this deal
              </p>
              <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
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
            >
              {getDiscountCodeMutation.isPending ? (
                "Getting Code..."
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
                    <div>
                      <p className="text-sm text-green-700 mb-1">Your Discount Code:</p>
                      <code className="text-lg font-mono font-bold text-green-800 bg-white px-2 py-1 rounded">
                        {discountCode}
                      </code>
                      <p className="text-xs text-green-600 mt-2">
                        Present your membership card at checkout to get discount on total bill
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(discountCode)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        {codeRevealed && (
          <Button
            onClick={() => onClaim?.(deal.id)}
            className="flex-1"
            size="lg"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Claim Deal
          </Button>
        )}
        
        <div className="flex gap-2 flex-1">
          {deal.vendor && (
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleGetDirections}
              className="flex-1"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Directions
            </Button>
          )}
          
          <Button variant="outline" size="lg" className="flex-1">
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit Store
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}