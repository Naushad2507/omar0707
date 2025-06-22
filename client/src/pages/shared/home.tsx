import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import Carousel from "@/components/ui/carousel";
import CategoryCard from "@/components/ui/category-card";
import DealCard from "@/components/ui/deal-card";
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

  const handleDealClick = () => {
    if (isAuthenticated) {
      navigate("/customer/deals");
    } else {
      navigate("/login");
    }
  };

  // Get featured cities with Indian iconic structures
  const featuredCities = [
    { 
      id: "taj-mahal",
      name: "Agra", 
      image: "https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      dealCount: 2845,
      monument: "Taj Mahal"
    },
    { 
      id: "india-gate",
      name: "Delhi", 
      image: "https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      dealCount: 2134,
      monument: "India Gate"
    },
    { 
      id: "gateway-of-india",
      name: "Mumbai", 
      image: "https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      dealCount: 1987,
      monument: "Gateway of India"
    },
    { 
      id: "charminar",
      name: "Hyderabad", 
      image: "https://images.pexels.com/photos/10752318/pexels-photo-10752318.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      dealCount: 1543,
      monument: "Charminar"
    },
    { 
      id: "golden-temple",
      name: "Amritsar", 
      image: "https://images.pexels.com/photos/2611810/pexels-photo-2611810.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      dealCount: 1234,
      monument: "Golden Temple"
    },
    { 
      id: "red-fort",
      name: "New Delhi", 
      image: "https://images.pexels.com/photos/6467191/pexels-photo-6467191.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      dealCount: 1876,
      monument: "Red Fort"
    },
    { 
      id: "qutb-minar",
      name: "South Delhi", 
      image: "https://images.pexels.com/photos/13881271/pexels-photo-13881271.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      dealCount: 1456,
      monument: "Qutb Minar"
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
                <Button size="lg" onClick={handleDealClick}>
                  Explore Deals
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/vendor/benefits">Join as Vendor</Link>
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
            <Link href="/pricing">View Plans</Link>
          </Button>
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
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {deals
                .sort((a: any, b: any) => (b.currentRedemptions || 0) - (a.currentRedemptions || 0))
                .slice(0, 15)
                .map((deal: any) => (
                <div key={deal.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer" onClick={handleDealClick}>
                  <img 
                    src={deal.imageUrl} 
                    alt={deal.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{deal.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{deal.vendor?.businessName || 'Vendor'}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-primary">
                        {deal.currentRedemptions || 0} Claims
                      </div>
                      <Badge variant="secondary" className="bg-saffron/10 text-saffron">
                        {deal.discountPercentage}% OFF
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Button onClick={handleDealClick}>
                View All Deals
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Cities Section */}
      <section className="py-16 bg-gradient-to-br from-saffron/5 to-royal/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Iconic India, Great Deals</h2>
            <p className="text-gray-600">Discover incredible offers near India's most famous landmarks</p>
          </div>
          
          <div className="grid md:grid-cols-4 lg:grid-cols-7 gap-6 mb-12">
            {featuredCities.map((city) => (
              <div key={city.id} className="group cursor-pointer">
                <img 
                  src={city.image} 
                  alt={`${city.monument} in ${city.name}`}
                  className="w-full h-48 object-cover rounded-xl group-hover:shadow-lg transition-all"
                />
                <div className="mt-4 text-center">
                  <h3 className="font-semibold text-gray-900">{city.name}</h3>
                  <p className="text-sm text-primary font-medium">{city.monument}</p>
                  <p className="text-sm text-gray-500">{city.dealCount} active deals</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Location Detection */}
          <div className="text-center">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Auto-Detect Location</h3>
                <p className="text-gray-600 mb-4">We'll find the best deals near you automatically</p>
                <Button onClick={handleDetectLocation}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Detect My Location
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Saving?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of users who save money every day</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
