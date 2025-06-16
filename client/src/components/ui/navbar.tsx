import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, MapPin, User, LogOut, Home, ShoppingBag, CreditCard, Store, Settings, Users, BarChart3, HelpCircle } from "lucide-react";
import { majorCities } from "@/lib/cities";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import InstoredeelzLogo from "@/components/ui/instoredealz-logo";

interface NavbarProps {
  selectedCity?: string;
  onCityChange?: (city: string) => void;
}

export default function Navbar({ selectedCity, onCityChange }: NavbarProps) {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "customer": return "/customer/dashboard";
      case "vendor": return "/vendor/dashboard";
      case "admin": return "/admin/dashboard";
      case "superadmin": return "/superadmin/dashboard";
      default: return "/";
    }
  };

  const getNavigationItems = () => {
    if (!isAuthenticated || !user) {
      return [
        { label: "Home", href: "/", icon: Home },
        { label: "Pricing", href: "/pricing", icon: CreditCard },
        { label: "For Vendors", href: "/vendor/benefits", icon: Store },
        { label: "Help", href: "/help", icon: HelpCircle },
      ];
    }

    const baseItems = {
      customer: [
        { label: "Dashboard", href: "/customer/dashboard", icon: Home },
        { label: "Deals", href: "/customer/deals", icon: ShoppingBag },
        { label: "My Claims", href: "/customer/claims", icon: CreditCard },
        { label: "Help", href: "/help", icon: HelpCircle },
      ],
      vendor: [
        { label: "Dashboard", href: "/vendor/dashboard", icon: Home },
        { label: "My Deals", href: "/vendor/deals", icon: ShoppingBag },
        { label: "Analytics", href: "/vendor/dashboard", icon: BarChart3 },
        { label: "Help", href: "/help", icon: HelpCircle },
      ],
      admin: [
        { label: "Dashboard", href: "/admin/dashboard", icon: Home },
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Vendors", href: "/admin/vendors", icon: Store },
        { label: "Deals", href: "/admin/deals", icon: ShoppingBag },
        { label: "Help", href: "/help", icon: HelpCircle },
      ],
      superadmin: [
        { label: "Dashboard", href: "/admin/dashboard", icon: Home },
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Vendors", href: "/admin/vendors", icon: Store },
        { label: "Deals", href: "/admin/deals", icon: ShoppingBag },
        { label: "System Logs", href: "/superadmin/logs", icon: Settings },
        { label: "Help", href: "/help", icon: HelpCircle },
      ]
    };

    return baseItems[user.role as keyof typeof baseItems] || [];
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/">
                <InstoredeelzLogo size="md" className="cursor-pointer" />
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors ${
                      location === item.href ? "text-primary font-medium" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* City Selector */}
            <Select value={selectedCity} onValueChange={onCityChange}>
              <SelectTrigger className="w-40">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <SelectValue placeholder="Select City" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {majorCities.map((city) => (
                  <SelectItem key={city.name} value={city.name}>
                    <div className="flex justify-between items-center w-full">
                      <span>{city.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {city.dealCount} deals
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Auth Buttons */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-primary capitalize">{user.membershipPlan} Member</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()} className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2 pb-4 border-b">
                    <h2 className="text-lg font-semibold">Menu</h2>
                  </div>
                  
                  {/* Navigation Items */}
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 ${
                          location === item.href ? "bg-primary/10 text-primary" : ""
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                  
                  {/* Auth Section for Mobile */}
                  {!isAuthenticated && (
                    <div className="pt-4 border-t space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        asChild
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button 
                        className="w-full" 
                        asChild
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                  
                  {isAuthenticated && user && (
                    <div className="pt-4 border-t">
                      <div className="p-2 rounded-lg bg-gray-50">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs text-primary capitalize">{user.membershipPlan} Member</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-2 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
