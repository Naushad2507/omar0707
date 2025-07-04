import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import Carousel from "@/components/ui/carousel";
import CategoryCard from "@/components/ui/category-card";
import DealCard from "@/components/ui/deal-card";
import DealCarousel from "@/components/ui/deal-carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shirt, 
  Laptop, 
  Plane, 
  Utensils, 
  Home as HomeIcon, 
  Dumbbell,
  MapPin,
  Users,
  Store,
  TrendingUp,
  Star,
  Heart,
  Gem,
  Plus,
  Music,
  Calendar,
  Building,
  GraduationCap,
  User,
  Handshake,
  Car,
  Wrench,
  MoreHorizontal
} from "lucide-react";
import { detectUserLocation } from "@/lib/cities";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const categoryIcons = {
  electronics: Laptop,
  fashion: Shirt,
  beauty: Heart,
  luxury: Gem,
  horoscope: Star,
  health: Plus,
  restaurants: Utensils,
  entertainment: Music,
  home: HomeIcon,
  events: Calendar,
  realestate: Building,
  education: GraduationCap,
  freelancers: User,
  consultants: Handshake,
  travel: Plane,
  automotive: Car,
  services: Wrench,
  others: MoreHorizontal,
};

const carouselSlides = [
  {
    id: "1",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    title: "Electronics Sale",
    subtitle: "Up to 70% Off",
    category: "electronics"
  },
  {
    id: "2", 
    imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    title: "Fashion Week",
    subtitle: "Buy 2 Get 1 Free",
    category: "fashion"
  },
  {
    id: "3",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    title: "Travel Packages",
    subtitle: "Save ₹10,000",
    category: "travel"
  }
];

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<string>("Mumbai");
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: categories } = useQuery<Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    dealCount: number;
  }>>({
    queryKey: ["/api/categories"],
  });

  const { data: deals } = useQuery<Array<any>>({
    queryKey: ["/api/deals", selectedCity],
  });

  const { data: cities } = useQuery<Array<any>>({
    queryKey: ["/api/cities"],
  });

  const handleDetectLocation = async () => {
    try {
      const location = await detectUserLocation();
      setSelectedCity(location.city);
      toast({
        title: "Location detected",
        description: `Found deals in ${location.city}, ${location.state}`,
      });
    } catch (error) {
      toast({
        title: "Location detection failed",
        description: "Please select your city manually",
        variant: "destructive",
      });
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (isAuthenticated) {
      navigate(`/customer/deals?category=${categoryId}`);
    } else {
      navigate("/login");
    }
  };

  const handleDealClick = (dealId?: number) => {
    if (dealId) {
      // Navigate to specific deal page
      navigate(`/deals/${dealId}`);
    } else {
      // Navigate to all deals page
      if (isAuthenticated) {
        navigate("/customer/deals");
      } else {
        navigate("/login");
      }
    }
  };

  const handleViewAllDeals = () => {
    if (isAuthenticated) {
      navigate("/customer/deals");
    } else {
      navigate("/login");
    }
  };

  // Get trending deals (sorted by view count and recent claims)
  const trendingDeals = deals?.slice(0, 6) || [];

  // Get featured deals (remaining deals for featured section)
  const featuredDeals = deals?.slice(6, 14) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar selectedCity={selectedCity} onCityChange={setSelectedCity} />
      
      {/* Hero Section */}
      <section className="py-16 relative overflow-hidden">
        {/* Clean background without images */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-royal/10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Discover <span className="text-primary">Deals</span> Near You
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of savvy shoppers and local businesses on India's fastest-growing deals platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={handleViewAllDeals}>
                  Explore Deals
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/vendor/benefits">Join as Vendor</Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-success mr-2" />
                  <span>10k+ Happy Customers</span>
                </div>
                <div className="flex items-center">
                  <Store className="h-5 w-5 text-warning mr-2" />
                  <span>500+ Partner Stores</span>
                </div>
              </div>
            </div>
            
            {/* Featured Deals Carousel */}
            <div className="relative animate-slide-in">
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-saffron" />
                    Trending Deals
                  </h3>
                  <Carousel slides={carouselSlides} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover amazing deals across all your favorite categories
            </p>
          </div>
          
          {categories && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category: any) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  icon={categoryIcons[category.id as keyof typeof categoryIcons] || Building}
                  dealCount={category.dealCount}
                  color={category.color}
                  onClick={() => handleCategoryClick(category.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-12 flash-peacock">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">🎉 Limited Time Offer!</h3>
          <p className="text-lg mb-2">Enjoy 1 Year Free Premium Plan – Offer valid until 14th August 2026</p>
          <p className="text-sm opacity-90 mb-4">New users only. Automatic upgrade after promotional period.</p>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/pricing">View Plans</Link>
          </Button>
        </div>
      </section>

      {/* Featured Deals Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Deals</h2>
            <p className="text-gray-600">Handpicked premium offers just for you</p>
          </div>
          
          <DealCarousel 
            deals={featuredDeals}
            onDealClick={handleDealClick}
            showClaims={false}
            autoPlay={true}
            interval={5000}
          />
          
          <div className="text-center mt-8">
            <Button onClick={handleViewAllDeals} size="lg" className="bg-primary hover:bg-primary/90">
              View All Deals
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Deals Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trending Deals</h2>
            <p className="text-gray-600">Hot deals that everyone's talking about</p>
          </div>
          
          <DealCarousel 
            deals={trendingDeals}
            onDealClick={handleDealClick}
            showClaims={false}
            autoPlay={true}
            interval={4500}
          />
          
          <div className="text-center mt-8">
            <Button onClick={handleViewAllDeals} size="lg" className="bg-primary hover:bg-primary/90">
              View All Deals
            </Button>
          </div>
        </div>
      </section>

      {/* Most Claimed Deals */}
      {deals && deals.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Most Claimed Deals</h2>
              <p className="text-gray-600">Popular deals that everyone loves</p>
            </div>
            
            <DealCarousel 
              deals={deals
                .sort((a: any, b: any) => (b.currentRedemptions || 0) - (a.currentRedemptions || 0))
                .slice(0, 12)
                .map((deal: any) => ({
                  ...deal,
                  vendor: deal.vendor?.businessName || 'Vendor',
                  location: `${deal.vendor?.city || 'Mumbai'}, ${deal.vendor?.state || 'Maharashtra'}`,
                  validUntil: deal.validUntil || 'Dec 31, 2024'
                }))}
              onDealClick={handleDealClick}
              showClaims={true}
              autoPlay={true}
              interval={4000}
            />
            
            <div className="text-center mt-8">
              <Button onClick={handleViewAllDeals} size="lg" className="bg-primary hover:bg-primary/90">
                View All Deals
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Saving?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of users who save money every day</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/signup">Get Started Free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
