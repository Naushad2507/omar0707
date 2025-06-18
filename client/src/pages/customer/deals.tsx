import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import DealCard from "@/components/ui/deal-card";
import CategoryCard from "@/components/ui/category-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth, hasMembershipLevel } from "@/lib/auth";
import { 
  Search, 
  Filter, 
  Shirt, 
  Laptop, 
  Plane, 
  Utensils, 
  Home as HomeIcon, 
  Dumbbell,
  Loader2,
  MapPin,
  Smartphone,
  Sparkles,
  Gem,
  Star,
  Heart,
  Camera,
  Music,
  Calendar,
  Building,
  GraduationCap,
  PenTool,
  Briefcase,
  Car,
  Wrench,
  Gift
} from "lucide-react";

const categoryIcons = {
  electronics: Smartphone,
  fashion: Shirt,
  beauty: Sparkles,
  luxury: Gem,
  horoscope: Star,
  health: Heart,
  restaurants: Utensils,
  entertainment: Camera,
  home: HomeIcon,
  events: Calendar,
  realestate: Building,
  education: GraduationCap,
  freelancers: PenTool,
  consultants: Briefcase,
  travel: Plane,
  automotive: Car,
  services: Wrench,
  others: Gift,
};

export default function CustomerDeals() {
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [location] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const category = urlParams.get('category');
    const highlight = urlParams.get('highlight');
    
    if (category) {
      setSelectedCategory(category);
    }
    
    if (highlight) {
      // Scroll to highlighted deal after component mounts
      setTimeout(() => {
        const element = document.getElementById(`deal-${highlight}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('animate-pulse');
          setTimeout(() => element.classList.remove('animate-pulse'), 2000);
        }
      }, 500);
    }
  }, [location]);

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: deals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/deals", selectedCity, selectedCategory],
  });

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
    onSuccess: () => {
      toast({
        title: "Deal claimed successfully!",
        description: "You can view your claimed deals in your dashboard.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/claims"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to claim deal",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? "" : categoryId);
  };

  const handleClaimDeal = async (deal: any) => {
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

  // Filter and sort deals
  const filteredDeals = deals?.filter((deal: any) => {
    const matchesSearch = searchQuery === "" || 
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.vendor?.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }) || [];

  const sortedDeals = [...filteredDeals].sort((a: any, b: any) => {
    switch (sortBy) {
      case "discount":
        return b.discountPercentage - a.discountPercentage;
      case "popular":
        return b.viewCount - a.viewCount;
      case "ending":
        return new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
      default: // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar selectedCity={selectedCity} onCityChange={setSelectedCity} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Discover Amazing Deals
          </h1>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span>Showing deals in {selectedCity}</span>
            {selectedCategory && (
              <>
                <span className="mx-2">•</span>
                <Badge variant="secondary" className="capitalize">
                  {selectedCategory}
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Categories */}
        {categories && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {categories.map((category: any) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  icon={categoryIcons[category.id as keyof typeof categoryIcons]}
                  dealCount={category.dealCount}
                  color={category.color}
                  onClick={() => handleCategoryClick(category.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search deals, vendors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="discount">Highest Discount</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="ending">Ending Soon</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory("");
                  setSearchQuery("");
                  setSortBy("newest");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deals Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading deals...</span>
          </div>
        ) : sortedDeals.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDeals.map((deal: any) => {
              const isInWishlist = wishlist?.some((item: any) => item.dealId === deal.id);
              return (
                <div key={deal.id} id={`deal-${deal.id}`}>
                  <DealCard
                    {...deal}
                    isFavorite={isInWishlist}
                    onClaim={() => handleClaimDeal(deal)}
                    onToggleFavorite={() => handleToggleFavorite(deal.id)}
                    onView={() => {
                      window.location.href = `/customer/deals/${deal.id}`;
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedCategory 
                  ? "Try adjusting your search or filters"
                  : `No deals available in ${selectedCity} right now`
                }
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory("");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading overlay for claim mutation */}
        {claimDealMutation.isPending && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card>
              <CardContent className="p-6 flex items-center space-x-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>Claiming deal...</span>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
