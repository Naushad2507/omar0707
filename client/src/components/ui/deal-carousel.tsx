import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";

interface Deal {
  id: number;
  title: string;
  vendor?: string | { businessName?: string; city?: string; state?: string };
  category: string;
  discountPercentage: number;
  imageUrl: string;
  claims?: number;
  currentRedemptions?: number;
  timeLeft?: string;
  validUntil?: string;
  location?: string;
  city?: string;
  state?: string;
}

interface DealCarouselProps {
  deals: Deal[];
  onDealClick: (dealId?: number) => void;
  showClaims?: boolean;
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}

export default function DealCarousel({ deals, onDealClick, showClaims = false, className = "", autoPlay = false, interval = 4000 }: DealCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, navigate] = useLocation();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Responsive cards per view
  const getCardsPerView = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1; // Mobile: 1 card
      if (window.innerWidth < 1024) return 2; // Tablet: 2 cards
      return 3; // Desktop: 3 cards
    }
    return 3;
  };
  
  const [cardsPerView, setCardsPerView] = useState(getCardsPerView());
  const maxIndex = Math.max(0, deals.length - cardsPerView);
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;
  
  // Update cards per view on window resize
  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Touch event handlers for swipe navigation
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentIndex < maxIndex) {
      goToNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      goToPrevious();
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || deals.length <= cardsPerView) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, deals.length, cardsPerView, maxIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  if (deals.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No deals available</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Carousel Container */}
      <div 
        className="overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-4 sm:gap-6"
          style={{ transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)` }}
        >
          {deals.map((deal) => (
            <div 
              key={deal.id} 
              className="flex-shrink-0"
              style={{ width: `${100 / cardsPerView}%` }}
            >
              <div className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border" onClick={(e) => {
                e.stopPropagation();
                navigate(`/deals/${deal.id}`);
              }}>
                <div className="relative">
                  {deal.imageUrl ? (
                    <img 
                      src={deal.imageUrl} 
                      alt={deal.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400";
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">🎁</div>
                        <div className="text-sm">Deal Available</div>
                      </div>
                    </div>
                  )}
                  {/* Flashing Discount Badge */}
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold animate-pulse">
                    <span className="animate-bounce">{deal.discountPercentage}% OFF</span>
                  </div>
                  {!showClaims && (
                    <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      🔥 TRENDING
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{deal.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {typeof deal.vendor === 'string' ? deal.vendor : deal.vendor?.businessName || 'Vendor'}
                  </p>
                  
                  {/* Location and Validity */}
                  <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                    {(deal.location || deal.city || (typeof deal.vendor === 'object' && deal.vendor?.city)) && (
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>
                          {deal.location || 
                           deal.city || 
                           (typeof deal.vendor === 'object' && deal.vendor?.city ? 
                            `${deal.vendor.city}${deal.vendor.state ? `, ${deal.vendor.state}` : ''}` : 
                            'Location Available')}
                        </span>
                      </div>
                    )}
                    {(deal.validUntil || deal.timeLeft) && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {deal.validUntil ? `Valid until ${deal.validUntil}` : `Ends in ${deal.timeLeft}`}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {showClaims ? (
                      <div className="text-lg font-bold text-primary">
                        {deal.currentRedemptions || deal.claims || 0} Claims
                      </div>
                    ) : (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-600">
                        {deal.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Mobile Optimized */}
      {deals.length > cardsPerView && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 sm:left-0 sm:-translate-x-4 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm shadow-lg hover:bg-card h-10 w-10 sm:h-12 sm:w-12 z-10 border"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 sm:right-0 sm:translate-x-4 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm shadow-lg hover:bg-card h-10 w-10 sm:h-12 sm:w-12 z-10 border"
            onClick={goToNext}
            disabled={currentIndex >= maxIndex}
          >
            <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator - Mobile Optimized */}
      {deals.length > cardsPerView && (
        <div className="flex justify-center mt-4 sm:mt-6 space-x-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 sm:w-2 sm:h-2 rounded-full transition-colors touch-manipulation ${
                index === currentIndex ? "bg-primary" : "bg-gray-300"
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}