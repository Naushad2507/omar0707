import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Navigation, 
  Target, 
  Compass, 
  Info,
  CheckCircle,
  ChevronRight,
  Smartphone,
  Shield,
  Clock
} from "lucide-react";

export default function GeolocationTutorial() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Enable Location Services",
      description: "Allow Instoredealz to access your location for personalized nearby deals",
      icon: Smartphone,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-600 font-semibold text-sm">1</span>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Browser Permission</h4>
              <p className="text-sm text-muted-foreground">
                When prompted, click "Allow" to enable location access. This helps us find deals near you.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-600 font-semibold text-sm">2</span>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Automatic Detection</h4>
              <p className="text-sm text-muted-foreground">
                Your location is detected automatically and cached for 5 minutes for quick access.
              </p>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your location data is only used to find nearby deals and is never stored on our servers.
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      title: "Smart Distance Filtering",
      description: "Adjust search radius to find deals within your preferred distance",
      icon: Target,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Target className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Adjustable Radius</h4>
              <p className="text-sm text-muted-foreground">
                Use the slider to set your search radius from 1km to 25km based on how far you're willing to travel.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Distance Display</h4>
              <p className="text-sm text-muted-foreground">
                Each deal shows exact distance (e.g., "1.2km", "500m") so you know how close it is.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">Pro Tip</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Start with a 5km radius and expand if needed. Most users find great deals within 3km of their location.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Location Hints & Navigation",
      description: "Get helpful directions and landmarks to reach deal locations easily",
      icon: Compass,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Navigation className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Direction Hints</h4>
              <p className="text-sm text-muted-foreground">
                See clear directions like "2.1km North" or "500m Southwest in Mall Road" for easy navigation.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Compass className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Smart Relevance</h4>
              <p className="text-sm text-muted-foreground">
                Deals are ranked by relevance considering distance, discount percentage, popularity, and expiry.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
              <div className="text-xs font-medium text-blue-800 mb-1">Very Close</div>
              <div className="text-xs text-blue-600">"Very close to you near Central Mall"</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
              <div className="text-xs font-medium text-green-800 mb-1">Detailed</div>
              <div className="text-xs text-green-600">"1.5km Northeast in MG Road"</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Real-Time Updates",
      description: "Stay updated with fresh deals and accurate location data",
      icon: Clock,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Auto Refresh</h4>
              <p className="text-sm text-muted-foreground">
                Location and deals refresh automatically to ensure you see the most current offers.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <CheckCircle className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Accuracy Indicator</h4>
              <p className="text-sm text-muted-foreground">
                See your location accuracy (e.g., "±15m") to understand how precise the distance calculations are.
              </p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Use the "Update Location" button if you've moved to get fresh results for your new position.
            </AlertDescription>
          </Alert>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
            <h4 className="font-semibold mb-2">Ready to Start?</h4>
            <p className="text-sm opacity-90">
              Click "Enable Location & Find Deals" to discover amazing offers near you!
            </p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-xl">
          {currentStepData.title}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          {currentStepData.description}
        </p>
        
        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep 
                  ? 'bg-blue-600' 
                  : index < currentStep 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          {currentStepData.content}
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <Button 
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
          >
            {currentStep === steps.length - 1 ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Get Started
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}