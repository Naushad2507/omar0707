import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, CreditCard, CheckCircle, Star, Crown, Zap } from 'lucide-react';

// Mock useAuth hook for now - replace with actual implementation
const useAuth = () => {
  // This would come from your auth context/store
  const user = {
    id: 1,
    email: 'user@example.com',
    name: 'Test User',
    isAuthenticated: true
  };
  
  return {
    user,
    isAuthenticated: user.isAuthenticated,
    isLoading: false
  };
};

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  badge?: string;
  popular?: boolean;
}

interface PaymentResponse {
  success: boolean;
  subscriptionId: string;
  paymentId: string;
  message: string;
}

// Razorpay Test Configuration
const RAZORPAY_CONFIG = {
  testMode: true,
  // Use Razorpay test key - user should replace with actual test key
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXX',
  testCards: {
    success: '4111111111111111', // Always succeeds
    failure: '4000000000000002'  // Always fails
  },
  testUPI: 'success@razorpay'
};

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'premium',
    name: 'Premium',
    price: 500, // ₹500 in test mode
    duration: 'month',
    features: [
      'Access to premium deals',
      'Unlimited deal claims',
      'Priority customer support',
      'Mobile app access',
      'Email notifications'
    ],
    badge: 'Most Popular',
    popular: true
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: 1000,
    duration: 'month',
    features: [
      'All Premium features',
      'Exclusive VIP deals',
      'Personal deal curator',
      'Early access to new deals',
      'Concierge support',
      'Custom deal requests'
    ],
    badge: 'Best Value'
  }
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);
  
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for saving subscription
  const saveSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionData: {
      planId: string;
      paymentId: string;
      amount: number;
      userId: number;
    }): Promise<PaymentResponse> => {
      const response = await fetch('/api/save-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save subscription');
      }

      const result: PaymentResponse = await response.json();
      return result;
    },
    onSuccess: (data) => {
      setPaymentResult(data);
      setShowSuccessDialog(true);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Subscription Activated! 🎉",
        description: "Your premium subscription is now active. Enjoy exclusive deals!",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to activate subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const initializeRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    setSelectedPlan(plan);
    setIsPaymentLoading(true);

    try {
      // Initialize Razorpay
      const razorpayLoaded = await initializeRazorpay();
      if (!razorpayLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Razorpay payment options (TEST MODE)
      const options = {
        key: RAZORPAY_CONFIG.keyId, // Test key from configuration
        amount: plan.price * 100, // Amount in paise
        currency: 'INR',
        name: 'Instoredealz (TEST MODE)',
        description: `${plan.name} Subscription - ${plan.duration}ly (TEST)`,
        image: '/logo.png', // Add your logo
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: () => {
            setIsPaymentLoading(false);
            toast({
              title: "Payment Cancelled",
              description: "Payment was cancelled by user",
              variant: "default",
            });
          }
        },
        handler: async (response: any) => {
          // Payment successful
          try {
            await saveSubscriptionMutation.mutateAsync({
              planId: plan.id,
              paymentId: response.razorpay_payment_id,
              amount: plan.price,
              userId: user?.id || 0,
            });
          } catch (error) {
            console.error('Failed to save subscription:', error);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initialization failed:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      setIsPaymentLoading(false);
      setSelectedPlan(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ✨ Premium Subscriptions
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Unlock exclusive deals, priority support, and premium features with our subscription plans
        </p>
      </div>

      {/* Authentication Notice */}
      {!isAuthenticated && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Crown className="h-6 w-6 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                  Login Required
                </h3>
                <p className="text-amber-700 dark:text-amber-300">
                  Please log in to your account to subscribe to premium plans
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              plan.popular ? 'border-2 border-blue-500 ring-2 ring-blue-100' : 'hover:border-primary/20'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1">
                  {plan.badge}
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4 pt-6">
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-2">
                  {plan.id === 'ultimate' ? (
                    <Crown className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <Star className="h-6 w-6 text-blue-500" />
                  )}
                  <span>{plan.name}</span>
                </CardTitle>
                <div className="space-y-1">
                  <div className="text-4xl font-bold text-primary">
                    ₹{plan.price}
                  </div>
                  <CardDescription>per {plan.duration}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Subscribe Button */}
              <Button
                onClick={() => handleSubscribe(plan)}
                disabled={!isAuthenticated || isPaymentLoading || saveSubscriptionMutation.isPending}
                className={`w-full py-6 text-lg font-semibold transition-all duration-300 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' 
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
                } text-white shadow-lg hover:shadow-xl`}
              >
                {isPaymentLoading && selectedPlan?.id === plan.id ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : saveSubscriptionMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Activating...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>

              {plan.popular && (
                <div className="text-center">
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    <Zap className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600 flex items-center justify-center space-x-2">
              <CheckCircle className="h-6 w-6" />
              <span>Subscription Activated!</span>
            </DialogTitle>
            <DialogDescription className="text-center space-y-2">
              <p>Your premium subscription has been successfully activated.</p>
              {paymentResult && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Payment ID: {paymentResult.paymentId}</p>
                  <p>Subscription ID: {paymentResult.subscriptionId}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="text-6xl">🎉</div>
            <div className="text-center space-y-2">
              <p className="font-semibold">Welcome to Premium!</p>
              <p className="text-sm text-muted-foreground">
                Start exploring exclusive deals and premium features now.
              </p>
            </div>
            <Button 
              onClick={() => setShowSuccessDialog(false)} 
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              Start Exploring
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subscription;