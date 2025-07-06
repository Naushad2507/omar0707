import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { 
  MapPin, 
  Navigation, 
  Loader2, 
  AlertTriangle, 
  Crosshair,
  RefreshCw,
  Star,
  Clock,
  Crown
} from "lucide-react";
import DealCard from "./deal-card";

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface LocationBasedDeal {
  id: number;
  title: string;
  description: string;
  category: string;
  discountPercentage: number;
  originalPrice: string;
  discountedPrice: string;
  validUntil: string;
  requiredMembership: string;
  currentRedemptions: number;
  viewCount: number;
  distance: number;
  distanceText: string;
  vendor: {
    businessName: string;
    address: string;
    city: string;
    state: string;
  };
  locationHint: string;
  relevanceScore: number;
}

interface GeolocationDealsProps {
  maxDistance?: number; // in kilometers
  limit?: number;
  categories?: string[];
  className?: string;
}

export default function GeolocationDeals({ 
  maxDistance = 10, 
  limit = 12, 
  categories = [],
  className = ""
}: GeolocationDealsProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState<PermissionState | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check geolocation permission status
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state);
        
        result.addEventListener('change', () => {
          setLocationPermission(result.state);
        });
      });
    }
  }, []);

  // Auto-get location on component mount if permission is granted
  useEffect(() => {
    if (locationPermission === 'granted' && !userLocation) {
      getCurrentLocation();
    }
  }, [locationPermission]);

  const getCurrentLocation = useCallback(() => {
    setIsGettingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setIsGettingLocation(false);
      toast({
        title: "Location Not Available",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000, // Cache for 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };
        
        setUserLocation(location);
        setIsGettingLocation(false);
        
        // Store location in localStorage for quick access
        localStorage.setItem('userLocation', JSON.stringify(location));
        
        toast({
          title: "Location Found!",
          description: `Found deals within ${maxDistance}km of your location.`,
        });
      },
      (error) => {
        let errorMessage = "Could not get your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
        
        setLocationError(errorMessage);
        setIsGettingLocation(false);
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      options
    );
  }, [maxDistance, toast]);

  // Load cached location on mount
  useEffect(() => {
    const cachedLocation = localStorage.getItem('userLocation');
    if (cachedLocation) {
      try {
        const location = JSON.parse(cachedLocation);
        // Check if cached location is less than 5 minutes old
        if (Date.now() - location.timestamp < 300000) {
          setUserLocation(location);
        }
      } catch (error) {
        localStorage.removeItem('userLocation');
      }
    }
  }, []);

  // Fetch location-based deals
  const { 
    data: nearbyDeals = [], 
    isLoading: isLoadingDeals,
    error: dealsError,
    refetch: refetchDeals
  } = useQuery<LocationBasedDeal[]>({
    queryKey: ['/api/deals/nearby', userLocation, maxDistance, categories],
    queryFn: async () => {
      if (!userLocation) return [];
      
      const response = await apiRequest('/api/deals/nearby', 'POST', {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        maxDistance,
        categories,
        limit
      }) as any;
      
      return response.deals || [];
    },
    enabled: !!userLocation,
  });

  const refreshLocation = () => {
    localStorage.removeItem('userLocation');
    getCurrentLocation();
  };

  if (!userLocation && !isGettingLocation && !locationError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Discover Nearby Deals
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
            <Crosshair className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Find Deals Near You</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get personalized deals based on your location with distance and direction hints.
            </p>
          </div>
          <Button onClick={getCurrentLocation} className="w-full">
            <Navigation className="h-4 w-4 mr-2" />
            Enable Location & Find Deals
          </Button>
          
          {locationPermission === 'denied' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Location access is blocked. Please enable location services in your browser settings to discover nearby deals.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  if (locationError) {
    return (
      <Card className={className}>
        <CardContent className="text-center space-y-4 p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Location Error</h3>
            <p className="text-sm text-muted-foreground mb-4">{locationError}</p>
          </div>
          <Button onClick={getCurrentLocation} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isGettingLocation || isLoadingDeals) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            {isGettingLocation ? "Finding Your Location..." : "Loading Nearby Deals..."}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (nearbyDeals.length === 0 && userLocation) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Nearby Deals
          </CardTitle>
          <Button variant="outline" size="sm" onClick={(e) => { e.preventDefault(); refetchDeals(); }}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">No Deals Found Nearby</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No deals found within {maxDistance}km of your location. Try increasing the search radius or check back later.
            </p>
          </div>
          <Button variant="outline" onClick={refreshLocation}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Location
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Nearby Deals
            <Badge variant="secondary" className="ml-2">
              {nearbyDeals.length} found
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Within {maxDistance}km • Accuracy: {userLocation?.accuracy ? `±${Math.round(userLocation.accuracy)}m` : 'Unknown'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshLocation}>
            <Navigation className="h-4 w-4 mr-1" />
            Update
          </Button>
          <Button variant="outline" size="sm" onClick={(e) => { e.preventDefault(); refetchDeals(); }}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nearbyDeals.map((deal) => (
            <div key={deal.id} className="relative">
              <DealCard
                {...deal}
                currentRedemptions={deal.currentRedemptions || 0}
                viewCount={deal.viewCount || 0}
                onClaim={() => {
                  // Handle deal claiming
                  toast({
                    title: "Feature Coming Soon",
                    description: "Deal claiming integration will be added.",
                  });
                }}
                onToggleFavorite={() => {
                  // Handle wishlist toggle
                  toast({
                    title: "Feature Coming Soon", 
                    description: "Wishlist integration will be added.",
                  });
                }}
                onView={() => {
                  window.location.href = `/deals/${deal.id}`;
                }}
              />
              
              {/* Location hint overlay */}
              <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {deal.distanceText}
              </div>
              
              {/* Location hint */}
              {deal.locationHint && (
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-card/95 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-gray-700 border">
                    <span className="font-medium">📍</span> {deal.locationHint}
                  </div>
                </div>
              )}
              
              {/* Relevance score badge */}
              {deal.relevanceScore > 85 && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  HOT
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}