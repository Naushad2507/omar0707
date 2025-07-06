import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import DealCard from "@/components/ui/deal-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Heart, Loader2, ShoppingBag } from "lucide-react";

export default function CustomerWishlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
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

  const handleRemoveFavorite = (dealId: number) => {
    removeFromWishlistMutation.mutate(dealId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-6">Please login to view your favorites.</p>
              <Button asChild>
                <Link to="/login">Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
          <p className="text-muted-foreground mt-1">
            Keep track of deals you love for easy access later
          </p>
        </div>

        {/* Wishlist Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading your favorites...</span>
          </div>
        ) : wishlist && wishlist.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item: any) => (
              <DealCard
                key={item.id}
                {...item.deal}
                isFavorite={true}
                onToggleFavorite={() => handleRemoveFavorite(item.dealId)}
                onClaim={() => {
                  // Handle claim logic here
                }}
                onView={() => {
                  // Handle view logic here
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-6">
                Start browsing deals and save your favorites for easy access later
              </p>
              <Button asChild>
                <Link to="/customer/deals">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Browse Deals
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading overlay */}
        {removeFromWishlistMutation.isPending && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card>
              <CardContent className="p-6 flex items-center space-x-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>Removing from favorites...</span>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}