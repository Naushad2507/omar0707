import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Eye, Heart, ExternalLink, Shield, Star, Users, Calendar, Tag, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";

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
    rating?: number;
    description?: string;
  };
  requiredMembership: string;
  discountCode?: string;
  terms?: string;
  isActive?: boolean;
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
  discountCode,
  terms,
  isActive = true,
  isFavorite = false,
  onClaim,
  onView,
  onToggleFavorite,
}: DealCardProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

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

      <CardFooter className="p-4 pt-0 space-y-2">
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button 
              variant="outline"
              className="w-full" 
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
                onView?.();
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Deal Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Tag className="h-5 w-5" />
                <span>{title}</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Deal Image */}
              {imageUrl && (
                <div className="relative">
                  <img 
                    src={imageUrl} 
                    alt={title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute top-4 right-4 bg-red-500 text-white rounded-full px-3 py-1 text-sm font-semibold">
                    {discountPercentage}% OFF
                  </div>
                </div>
              )}

              {/* Deal Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Deal Details</h3>
                    <p className="text-gray-700">{description}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Category:</span>
                      <Badge className={`${categoryColors[category as keyof typeof categoryColors]} border-0`}>
                        {category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-semibold text-red-600">{discountPercentage}% OFF</span>
                    </div>



                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Valid Until:</span>
                      <span className="font-medium">{formatDate(validUntil)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Membership:</span>
                      <Badge className={`${membershipColors[requiredMembership as keyof typeof membershipColors]} text-xs`}>
                        {requiredMembership.charAt(0).toUpperCase() + requiredMembership.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Vendor Information */}
                  {vendor && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Vendor Details</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{vendor.businessName}</span>
                        </div>
                        <div className="text-sm text-gray-600">{vendor.city}, {vendor.state}</div>
                        {vendor.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{vendor.rating}/5</span>
                          </div>
                        )}
                        {vendor.description && (
                          <p className="text-sm text-gray-600 mt-2">{vendor.description}</p>
                        )}
                      </div>
                    </div>
                  )}


                </div>
              </div>

              <Separator />

              {/* Discount Code Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Discount Code
                </h3>
                
                {user?.membershipPlan && user.membershipPlan !== 'basic' ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Use code:</span>
                      <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm font-bold">
                        {discountCode || `DEAL${id}`}
                      </code>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      Present your Membership card at Checkout to get discount
                    </p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-primary/10 to-royal/10 border border-primary/20 rounded-lg p-6 text-center">
                    <Shield className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Subscribe to Access Exclusive Deals and Discounts</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Upgrade your membership to unlock discount codes and get access to premium deals.
                    </p>
                    <Button className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Upgrade Membership
                    </Button>
                  </div>
                )}
              </div>

              {/* Terms and Conditions */}
              {terms && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Terms & Conditions
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{terms}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    setShowModal(false);
                    onClaim?.();
                  }}
                  disabled={!isActive || (maxRedemptions ? currentRedemptions >= maxRedemptions : false)}
                >
                  {maxRedemptions && currentRedemptions >= maxRedemptions ? "Sold Out" : "Claim This Deal"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.();
                  }}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          className="w-full" 
          onClick={(e) => {
            e.stopPropagation();
            onClaim?.();
          }}
          disabled={!isActive || (maxRedemptions ? currentRedemptions >= maxRedemptions : false)}
        >
          {maxRedemptions && currentRedemptions >= maxRedemptions ? "Sold Out" : "Claim Deal"}
        </Button>
      </CardFooter>
    </Card>
  );
}
