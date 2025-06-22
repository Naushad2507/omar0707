import { useState, useEffect } from "react";
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
  onDealClick: () => void;
  showClaims?: boolean;
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}

export default function DealCarousel({ deals, onDealClick, showClaims = false, className = "", autoPlay = false, interval = 4000 }: DealCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3;
  const maxIndex = Math.max(0, deals.length - cardsPerView);

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
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-6"
          style={{ transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)` }}
        >
          {deals.map((deal) => (
            <div 
              key={deal.id} 
              className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3"
            >
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border" onClick={onDealClick}>
                <div className="relative">
                  <img 
                    src={deal.imageUrl} 
                    alt={deal.title}
                    className="w-full h-48 object-cover"
                  />
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
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{deal.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">
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

      {/* Navigation Arrows */}
      {deals.length > cardsPerView && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg hover:bg-gray-50 h-12 w-12 z-10"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg hover:bg-gray-50 h-12 w-12 z-10"
            onClick={goToNext}
            disabled={currentIndex >= maxIndex}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {deals.length > cardsPerView && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-primary" : "bg-gray-300"
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}