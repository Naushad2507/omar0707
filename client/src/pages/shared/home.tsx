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

  // Mock trending deals data
  const trendingDeals = [
    {
      id: 1,
      title: "Premium Wireless Headphones - Limited Edition",
      vendor: "TechWorld Electronics",
      category: "Electronics",
      discountPercentage: 50,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      claims: 1250,
      timeLeft: "2 days",
      location: "Mumbai, Maharashtra",
      validUntil: "Dec 31, 2024"
    },
    {
      id: 2,
      title: "Designer Ethnic Wear Collection - Festive Special",
      vendor: "Ethnic Styles Boutique",
      category: "Fashion",
      discountPercentage: 50,
      imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      claims: 890,
      timeLeft: "5 hours",
      location: "Delhi, NCR",
      validUntil: "Dec 25, 2024"
    },
    {
      id: 3,
      title: "Gourmet Food Experience - 5 Course Meal",
      vendor: "Royal Dining Restaurant",
      category: "Food",
      discountPercentage: 50,
      imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      claims: 670,
      timeLeft: "1 day",
      location: "Bangalore, Karnataka",
      validUntil: "Dec 28, 2024"
    },
    {
      id: 4,
      title: "Luxury Spa Treatment Package",
      vendor: "Serenity Wellness Spa",
      category: "Beauty",
      discountPercentage: 60,
      imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      claims: 445,
      timeLeft: "3 days",
      location: "Pune, Maharashtra",
      validUntil: "Jan 5, 2025"
    },
    {
      id: 5,
      title: "Home Fitness Equipment Bundle",
      vendor: "FitLife Store",
      category: "Fitness",
      discountPercentage: 40,
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      claims: 320,
      timeLeft: "6 hours",
      location: "Hyderabad, Telangana",
      validUntil: "Dec 24, 2024"
    },
    {
      id: 6,
      title: "Premium Coffee Subscription - 3 Months",
      vendor: "Brew Masters Coffee",
      category: "Food",
      discountPercentage: 40,
      imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      claims: 780,
      timeLeft: "12 hours",
      location: "Chennai, Tamil Nadu",
      validUntil: "Dec 26, 2024"
    }
  ];

  // Mock featured deals data
  const featuredDeals = [
    {
      id: 7,
      title: "Smart Watch Pro Series",
      vendor: "Digital Hub",
      category: "Electronics",
      discountPercentage: 40,
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      claims: 234,
      location: "Mumbai, Maharashtra",
      validUntil: "Jan 10, 2025"
    },
    {
      id: 8,
      title: "Artisan Jewelry Set",
      vendor: "Golden Craft",
      category: "Luxury",
      discountPercentage: 40,
      imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      claims: 89,
      location: "Jaipur, Rajasthan",
      validUntil: "Jan 15, 2025"
    },
    {
      id: 9,
      title: "Professional Photography Course",
      vendor: "Creative Academy",
      category: "Education",
      discountPercentage: 50,
      imageUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      claims: 156,
      location: "Bangalore, Karnataka",
      validUntil: "Feb 1, 2025"
    },
    {
      id: 10,
      title: "Weekend Hill Station Trip",
      vendor: "Adventure Tours",
      category: "Travel",
      discountPercentage: 30,
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      claims: 67,
      location: "Shimla, Himachal Pradesh",
      validUntil: "Jan 20, 2025"
    },
    {
      id: 11,
      title: "Organic Skincare Kit",
      vendor: "Natural Beauty Co",
      category: "Beauty",
      discountPercentage: 40,
      imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      claims: 198,
      location: "Pune, Maharashtra",
      validUntil: "Dec 30, 2024"
    },
    {
      id: 12,
      title: "Home Decor Bundle",
      vendor: "Style Living",
      category: "Home",
      discountPercentage: 40,
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      claims: 123,
      location: "Delhi, NCR",
      validUntil: "Jan 5, 2025"
    },
    {
      id: 13,
      title: "Gourmet Cooking Class",
      vendor: "Culinary Institute",
      category: "Education",
      discountPercentage: 40,
      imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      claims: 87,
      location: "Chennai, Tamil Nadu",
      validUntil: "Jan 12, 2025"
    },
    {
      id: 14,
      title: "Yoga Membership - 6 Months",
      vendor: "Zen Wellness Center",
      category: "Fitness",
      discountPercentage: 40,
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      claims: 145,
      location: "Goa, India",
      validUntil: "Feb 15, 2025"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar selectedCity={selectedCity} onCityChange={setSelectedCity} />
      
      {/* Hero Section */}
      <section className="py-16 relative overflow-hidden">
        {/* Background Images of Indian Iconic Structures */}
        <div className="absolute inset-0">
          {/* Multiple background images with opacity overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-royal/10 z-10"></div>
          
          {/* Taj Mahal Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: `url('https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`
            }}
          ></div>
          
          {/* India Gate Background (layered) */}
          <div 
            className="absolute top-0 right-0 w-1/3 h-full bg-cover bg-center opacity-15"
            style={{
              backgroundImage: `url('https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=800&h=1080&fit=crop')`
            }}
          ></div>
          
          {/* Gateway of India Background (layered) */}
          <div 
            className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-cover bg-center opacity-15"
            style={{
              backgroundImage: `url('https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop')`
            }}
          ></div>
          
          {/* Red Fort Background (layered) */}
          <div 
            className="absolute top-0 left-1/3 w-1/3 h-1/2 bg-cover bg-center opacity-10"
            style={{
              backgroundImage: `url('https://images.pexels.com/photos/6467191/pexels-photo-6467191.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop')`
            }}
          ></div>
          
          {/* Golden Temple Background (layered) */}
          <div 
            className="absolute top-1/3 right-1/4 w-1/4 h-1/3 bg-cover bg-center opacity-12"
            style={{
              backgroundImage: `url('https://images.pexels.com/photos/2611810/pexels-photo-2611810.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop')`
            }}
          ></div>
          
          {/* Charminar Background (layered) */}
          <div 
            className="absolute bottom-1/4 right-1/3 w-1/4 h-1/3 bg-cover bg-center opacity-10"
            style={{
              backgroundImage: `url('https://images.pexels.com/photos/10752318/pexels-photo-10752318.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop')`
            }}
          ></div>
          
          {/* Qutb Minar Background (layered) */}
          <div 
            className="absolute bottom-0 left-1/2 w-1/5 h-1/2 bg-cover bg-center opacity-8"
            style={{
              backgroundImage: `url('https://images.pexels.com/photos/13881271/pexels-photo-13881271.jpeg?auto=compress&cs=tinysrgb&w=400&h=800&fit=crop')`
            }}
          ></div>
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
                  icon={categoryIcons[category.id as keyof typeof categoryIcons]}
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
