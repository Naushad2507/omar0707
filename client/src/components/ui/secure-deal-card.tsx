import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PinVerificationDialog } from "@/components/ui/pin-verification-dialog";
import { useAuth } from "@/lib/auth";
import {
  Clock,
  MapPin,
  Store,
  Crown,
  Lock,
  Zap,
  Star,
  ShoppingBag,
  ExternalLink,
  Navigation,
  Shield
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



export default function SecureDealCard({ deal, className = "", onClaim }: SecureDealCardProps) {
  const { user, isAuthenticated } = useAuth();
  const [showPinDialog, setShowPinDialog] = useState(false);





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
    
    // If deal requires basic membership or no specific membership, everyone can access
    if (!deal.requiredMembership || deal.requiredMembership === 'basic') {
      return true;
    }
    
    const membershipLevels = { basic: 1, premium: 2, ultimate: 3 };
    const userLevel = membershipLevels[user.membershipPlan as keyof typeof membershipLevels] || 1;
    const requiredLevel = membershipLevels[deal.requiredMembership as keyof typeof membershipLevels] || 1;
    
    return userLevel >= requiredLevel;
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
          
          <p className="text-sm text-muted-foreground line-clamp-2">
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
        {/* Action Buttons - Moved above validity section */}
        <div className="space-y-2">
          <Button
            onClick={() => setShowPinDialog(true)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            size="lg"
            disabled={!isAuthenticated}
          >
            <Shield className="w-4 h-4 mr-2" />
            Redeem Deal
          </Button>
          
          <div className="flex gap-2">
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
        </div>

        <Separator />

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
      </CardContent>

      <PinVerificationDialog
        open={showPinDialog}
        onOpenChange={setShowPinDialog}
        dealId={deal.id}
        dealTitle={deal.title}
        dealDiscountPercentage={deal.discountPercentage}
        onSuccess={() => onClaim?.(deal.id)}
      />
    </Card>
  );
}