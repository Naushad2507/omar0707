import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, ExternalLink } from "lucide-react";

interface NearbyDeal {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  discountPercentage: number;
  validUntil: string;
  requiredMembership: string;
  distance: string;
  vendor?: {
    businessName: string;
    city: string;
    state: string;
  };
}

interface NearbyDealsSectionProps {
  dealId: number;
}

export default function NearbyDealsSection({ dealId }: NearbyDealsSectionProps) {
  const { data: nearbyDeals, isLoading, error } = useQuery({
    queryKey: ['/api/deals/nearby', dealId],
    enabled: !!dealId,
  });

  const membershipColors = {
    basic: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700",
    premium: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    ultimate: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  };

  const categoryColors = {
    fashion: "bg-saffron/10 text-saffron",
    electronics: "bg-primary/10 text-primary",
    travel: "bg-success/10 text-success",
    food: "bg-warning/10 text-warning",
    home: "bg-royal/10 text-royal",
    fitness: "bg-secondary/10 text-secondary",
    restaurants: "bg-warning/10 text-warning",
    entertainment: "bg-primary/10 text-primary",
    events: "bg-secondary/10 text-secondary",
    realestate: "bg-primary/10 text-primary",
    education: "bg-success/10 text-success",
    freelancers: "bg-saffron/10 text-saffron",
    consultants: "bg-royal/10 text-royal",
    automotive: "bg-primary/10 text-primary",
    services: "bg-secondary/10 text-secondary",
    luxury: "bg-royal/10 text-royal",
    beauty: "bg-secondary/10 text-secondary",
    health: "bg-success/10 text-success",
    horoscope: "bg-warning/10 text-warning",
    others: "bg-warning/10 text-warning",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-3">
            <div className="flex space-x-3">
              <Skeleton className="h-16 w-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !nearbyDeals || nearbyDeals.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No nearby deals found at the moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {nearbyDeals.map((deal: NearbyDeal) => (
        <Card key={deal.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-3">
            <div className="flex space-x-3">
              {/* Deal Image */}
              <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {deal.imageUrl ? (
                  <img 
                    src={deal.imageUrl} 
                    alt={deal.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ExternalLink className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                  {deal.discountPercentage}%
                </div>
              </div>

              {/* Deal Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm text-foreground line-clamp-1">
                    {deal.title}
                  </h4>
                  <div className="flex items-center text-xs text-gray-500 ml-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{deal.distance} km</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                  {deal.description}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${categoryColors[deal.category as keyof typeof categoryColors]} text-xs`}>
                      {deal.category}
                    </Badge>
                    <Badge className={`${membershipColors[deal.requiredMembership as keyof typeof membershipColors]} text-xs`}>
                      {deal.requiredMembership}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Until {formatDate(deal.validUntil)}</span>
                  </div>
                </div>

                {deal.vendor && (
                  <div className="text-xs text-gray-500 mt-1">
                    {deal.vendor.businessName}, {deal.vendor.city}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}