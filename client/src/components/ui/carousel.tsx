import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  category: string;
}

interface CarouselProps {
  slides: CarouselSlide[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

export default function Carousel({ slides, autoPlay = true, interval = 4000, className = "" }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  if (slides.length === 0) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gray-100 h-48 flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No slides available</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Slides Container */}
      <div className="relative h-48">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3">
              <p className="font-semibold text-foreground">{slide.title}</p>
              <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card/90 h-8 w-8"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card/90 h-8 w-8"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? "bg-primary" : "bg-gray-300"
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
