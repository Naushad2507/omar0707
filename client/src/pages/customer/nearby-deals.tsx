import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import DealCard from "@/components/ui/deal-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { useLocation, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth, hasMembershipLevel } from "@/lib/auth";
import { 
  MapPin, 
  Navigation, 
  Loader2, 
  AlertTriangle, 
  Crosshair,
  RefreshCw,
  Star,
  Filter,
  ChevronLeft,
  Target,
  Compass,
  Crown
} from "lucide-react";

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

export default function NearbyDealsPage() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [maxDistance, setMaxDistance] = useState([10]);
  const [sortBy, setSortBy] = useState("relevance");
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

  // Load cached location on mount
  useEffect(() => {
    const cachedLocation = localStorage.getItem('userLocation');
    if (cachedLocation) {
      try {
        const location = JSON.parse(cachedLocation);
        // Check if cached location is less than 5 minutes old
        if (Date.now() - location.timestamp < 300000) {
          setUserLocation(location);
        } else {
          localStorage.removeItem('userLocation');
        }
      } catch (error) {
        localStorage.removeItem('userLocation');
      }
    }
  }, []);

  // Auto-get location if permission is granted and no cached location
  useEffect(() => {
    if (locationPermission === 'granted' && !userLocation && !isGettingLocation) {
      getCurrentLocation();
    }
  }, [locationPermission, userLocation, isGettingLocation]);

  const getCurrentLocation = () => {
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
          description: `Searching for deals within ${maxDistance[0]}km of your location.`,
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
  };

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Fetch nearby deals
  const { 
    data: nearbyDeals = [], 
    isLoading: isLoadingDeals,
    error: dealsError,
    refetch: refetchDeals
  } = useQuery<LocationBasedDeal[]>({
    queryKey: ['/api/deals/nearby', userLocation, maxDistance[0], selectedCategory],
    queryFn: async () => {
      if (!userLocation) return [];
      
      const response = await apiRequest('/api/deals/nearby', 'POST', {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        maxDistance: maxDistance[0],
        categories: selectedCategory ? [selectedCategory] : [],
        limit: 24
      }) as any;
      
      return response.deals || [];
    },
    enabled: !!userLocation,
  });

  // Wishlist queries and mutations
  const { data: wishlist = [] } = useQuery<any[]>({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (dealId: number) => {
      return apiRequest('/api/wishlist', 'POST', { dealId });
    },
    onSuccess: () => {
      toast({
        title: "Added to favorites!",
        description: "You can view your favorites in your dashboard.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add to favorites",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (dealId: number) => {
      return apiRequest(`/api/wishlist/${dealId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Removed from favorites",
        description: "Deal removed from your favorites.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove from favorites",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const claimDealMutation = useMutation({
    mutationFn: async (dealId: number) => {
      return apiRequest(`/api/deals/${dealId}/claim`, 'POST');
    },
    onSuccess: async (data: any) => {
      toast({
        title: "Deal Claimed Successfully!",
        description: data?.savingsAmount 
          ? `You saved ₹${data.savingsAmount}! Total savings: ₹${data.newTotalSavings}` 
          : "You can view your claimed deals in your dashboard.",
      });
      
      // Comprehensive data refresh to update user profile and deal listings
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/deals"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/users/claims"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] }),
      ]);
      
      // Force refetch user data to update dashboard statistics
      queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to claim deal",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleClaimDeal = async (deal: LocationBasedDeal) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to claim deals.",
        variant: "destructive",
      });
      return;
    }

    // Check membership requirements
    if (!hasMembershipLevel(user, deal.requiredMembership)) {
      toast({
        title: "Upgrade required",
        description: `This deal requires ${deal.requiredMembership} membership or higher.`,
        variant: "destructive",
      });
      return;
    }

    claimDealMutation.mutate(deal.id);
  };

  const handleToggleFavorite = (dealId: number) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add favorites.",
        variant: "destructive",
      });
      return;
    }

    const isInWishlist = wishlist?.some((item: any) => item.dealId === dealId);
    
    if (isInWishlist) {
      removeFromWishlistMutation.mutate(dealId);
    } else {
      addToWishlistMutation.mutate(dealId);
    }
  };

  // Sort deals
  const sortedDeals = [...nearbyDeals].sort((a, b) => {
    switch (sortBy) {
      case "distance":
        return a.distance - b.distance;
      case "discount":
        return b.discountPercentage - a.discountPercentage;
      case "ending":
        return new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
      default: // relevance
        return b.relevanceScore - a.relevanceScore;
    }
  });

  const refreshLocation = () => {
    localStorage.removeItem('userLocation');
    getCurrentLocation();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/customer/dashboard">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Compass className="h-6 w-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-foreground">
                Nearby Deals
              </h1>
            </div>
          </div>
          
          {userLocation ? (
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>Location accuracy: ±{Math.round(userLocation.accuracy)}m</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>Search radius: {maxDistance[0]}km</span>
              </div>
              {sortedDeals.length > 0 && (
                <Badge variant="secondary">
                  {sortedDeals.length} deals found
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Enable location services to discover deals near you</p>
          )}
        </div>

        {/* Location Setup */}
        {!userLocation && !isGettingLocation && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crosshair className="h-5 w-5" />
                Find Deals Near You
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <Navigation className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Discover Local Deals</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get personalized deals based on your location with distance and direction hints.
                </p>
              </div>
              <Button onClick={getCurrentLocation} className="w-full max-w-md">
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
              
              {locationError && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {locationError}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Location loading */}
        {isGettingLocation && (
          <Card className="mb-8">
            <CardContent className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">Finding Your Location...</h3>
              <p className="text-sm text-muted-foreground">
                Please allow location access to discover nearby deals.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Filters and Controls */}
        {userLocation && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-6">
                {/* Distance Slider */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Search Radius: {maxDistance[0]}km
                  </label>
                  <Slider
                    value={maxDistance}
                    onValueChange={setMaxDistance}
                    max={25}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1km</span>
                    <span>25km</span>
                  </div>
                </div>
                
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Category
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {(categories as any[]).map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Sort by
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Most Relevant</SelectItem>
                      <SelectItem value="distance">Closest First</SelectItem>
                      <SelectItem value="discount">Highest Discount</SelectItem>
                      <SelectItem value="ending">Ending Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={refreshLocation} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Update Location
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deals Grid */}
        {isLoadingDeals ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading nearby deals...</span>
          </div>
        ) : sortedDeals.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDeals.map((deal, index) => {
              const isInWishlist = wishlist?.some((item: any) => item.dealId === deal.id);
              return (
                <div key={deal.id} className="relative">
                  <DealCard
                    {...deal}
                    isFavorite={isInWishlist}
                    onClaim={() => handleClaimDeal(deal)}
                    onToggleFavorite={() => handleToggleFavorite(deal.id)}
                    onView={() => {
                      window.location.href = `/deals/${deal.id}`;
                    }}
                  />
                  
                  {/* Distance badge */}
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
                  
                  {/* Relevance indicator */}
                  {deal.relevanceScore > 85 && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      HOT
                    </div>
                  )}

                  {/* Position indicator */}
                  {index < 3 && (
                    <div className="absolute top-12 right-2 bg-blue-500 text-white w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : userLocation ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No Deals Found Nearby</h3>
              <p className="text-muted-foreground mb-4">
                No deals found within {maxDistance[0]}km of your location. 
                Try increasing the search radius or check back later.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={refreshLocation}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Location
                </Button>
                <Button variant="outline" onClick={() => setMaxDistance([25])}>
                  <Target className="h-4 w-4 mr-2" />
                  Expand Search to 25km
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Footer />
    </div>
  );
}