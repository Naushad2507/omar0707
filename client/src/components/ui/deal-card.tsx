import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MapPin, Clock, Eye, Heart } from "lucide-react";
import { useState, useEffect } from "react";

interface DealCardProps {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  discountPercentage: number;
  originalPrice?: string;
  discountedPrice?: string;
  validUntil: string;
  currentRedemptions: number;
  maxRedemptions?: number;
  viewCount: number;
  vendor?: {
    businessName: string;
    city: string;
    state: string;
  };
  requiredMembership: string;
  isFavorite?: boolean;
  onClaim?: () => void;
  onView?: () => void;
  onToggleFavorite?: () => void;
}

export default function DealCard({
  id,
  title,
  description,
  category,
  imageUrl,
  discountPercentage,
  originalPrice,
  discountedPrice,
  validUntil,
  currentRedemptions,
  maxRedemptions,
  viewCount,
  vendor,
  requiredMembership,
  isFavorite = false,
  onClaim,
  onView,
  onToggleFavorite,
}: DealCardProps) {
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    // Flash effect for high discount percentages
    if (discountPercentage >= 40) {
      const interval = setInterval(() => {
        setIsFlashing(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [discountPercentage]);
  const categoryColors = {
    fashion: "bg-saffron/10 text-saffron",
    electronics: "bg-primary/10 text-primary",
    travel: "bg-success/10 text-success",
    food: "bg-warning/10 text-warning",
    home: "bg-royal/10 text-royal",
    fitness: "bg-secondary/10 text-secondary",
  };

  const membershipColors = {
    basic: "bg-gray-100 text-gray-700",
    premium: "bg-primary/10 text-primary",
    ultimate: "bg-royal/10 text-royal",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const redemptionPercentage = maxRedemptions 
    ? (currentRedemptions / maxRedemptions) * 100 
    : 0;

  return (
    <Card className="deal-card h-full flex flex-col" onClick={onView}>
      {/* Image */}
      {imageUrl && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-12 left-2">
            <Badge className={`${categoryColors[category as keyof typeof categoryColors]} border-0`}>
              {category}
            </Badge>
          </div>
          <div className={`absolute top-2 right-2 rounded-full px-2 py-1 text-xs font-semibold transition-all duration-300 ${
            isFlashing 
              ? 'bg-red-500 text-white shadow-lg scale-110' 
              : 'bg-white/90 backdrop-blur-sm text-gray-900'
          }`}>
            {discountPercentage}% OFF
          </div>
          
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.();
            }}
            className="absolute top-2 left-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200"
          >
            <Heart 
              className={`h-4 w-4 transition-colors duration-200 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
              }`} 
            />
          </button>
          {viewCount > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white rounded px-2 py-1 text-xs flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{viewCount}</span>
            </div>
          )}
        </div>
      )}

      <CardContent className="flex-1 p-4">
        <div className="space-y-3">
          {/* Title and Description */}
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2">{title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{description}</p>
          </div>

          {/* Vendor Info */}
          {vendor && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{vendor.businessName}, {vendor.city}</span>
            </div>
          )}

          {/* Pricing */}
          {originalPrice && discountedPrice && (
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">₹{discountedPrice}</span>
              <span className="text-sm text-gray-500 line-through">₹{originalPrice}</span>
              <span className="text-sm font-medium text-success">
                Save ₹{(parseFloat(originalPrice) - parseFloat(discountedPrice)).toFixed(0)}
              </span>
            </div>
          )}

          {/* Validity and Redemptions */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>Valid until {formatDate(validUntil)}</span>
            </div>
            
            {maxRedemptions && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{currentRedemptions} claimed</span>
                  <span>{maxRedemptions} available</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-primary h-1 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(redemptionPercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Membership Requirement */}
          <div className="flex items-center justify-between">
            <Badge className={`${membershipColors[requiredMembership as keyof typeof membershipColors]} text-xs`}>
              {requiredMembership.charAt(0).toUpperCase() + requiredMembership.slice(1)} Required
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={(e) => {
            e.stopPropagation();
            onClaim?.();
          }}
          disabled={maxRedemptions ? currentRedemptions >= maxRedemptions : false}
        >
          {maxRedemptions && currentRedemptions >= maxRedemptions ? "Sold Out" : "Claim Deal"}
        </Button>
      </CardFooter>
    </Card>
  );
}
