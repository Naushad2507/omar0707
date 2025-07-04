import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CreditCard, 
  Crown, 
  Loader2, 
  CheckCircle, 
  Sparkles,
  Zap,
  Star
} from 'lucide-react';

// Razorpay will be available on window object

const SubscriptionButton = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for saving subscription
  const saveSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionData) => {
      const response = await apiRequest('/api/save-subscription', 'POST', subscriptionData);
      return response;
    },
    onSuccess: (data) => {
      setPaymentResult(data);
      setShowSuccessDialog(true);
      setIsProcessing(false);
      
      // Invalidate auth query to refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      // Make external API call
      callExternalApi(data);
      
      toast({
        title: "Subscription Activated! 🎉",
        description: "Your premium subscription is now active!",
        variant: "default",
      });
    },
    onError: (error) => {
      setIsProcessing(false);
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to activate subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  // External API call to instoredealz.com
  const callExternalApi = async (subscriptionData) => {
    try {
      const externalResponse = await fetch('https://api.instoredealz.com/S0G1IP/CustomerSubscription/SaveCustomerSubscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          subscriptionId: subscriptionData.subscriptionId,
          paymentId: subscriptionData.paymentId,
          planType: 'premium',
          amount: 500,
          currency: 'INR',
          activatedAt: new Date().toISOString(),
          expiryDate: subscriptionData.expiryDate
        }),
      });

      if (externalResponse.ok) {
        console.log('External API call successful');
      } else {
        console.warn('External API call failed, but local subscription is active');
      }
    } catch (error) {
      console.warn('External API call error:', error.message);
    }
  };

  // Initialize Razorpay script
  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle subscription purchase
  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to subscribe to premium features.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Initialize Razorpay
      const razorpayLoaded = await initializeRazorpay();
      if (!razorpayLoaded) {
        throw new Error('Failed to load Razorpay payment gateway');
      }

      // Configure Razorpay payment options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1234567890', // Use your actual Razorpay key
        amount: 50000, // ₹500 in paise (500 * 100)
        currency: 'INR',
        name: 'Instoredealz Premium',
        description: 'Premium Subscription - Monthly Access',
        image: '/logo.png', // Add your logo URL
        handler: async (response) => {
          // Payment successful callback
          try {
            await saveSubscriptionMutation.mutateAsync({
              planId: 'premium',
              paymentId: response.razorpay_payment_id,
              amount: 500,
              userId: user?.id,
            });
          } catch (error) {
            console.error('Failed to save subscription:', error);
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#3B82F6', // Blue theme color
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "Payment was cancelled. No charges were made.",
              variant: "default",
            });
          },
        },
      };

      // Open Razorpay payment modal
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Premium Subscription Card */}
      <Card className="relative overflow-hidden border-2 border-gradient-to-r from-blue-500 to-purple-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-500 to-purple-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
          PREMIUM
        </div>
        
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Premium Access
          </CardTitle>
          <div className="flex items-center justify-center space-x-1">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">₹500</span>
            <span className="text-gray-600 dark:text-gray-400">/month</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Features List */}
          <div className="space-y-2">
            {[
              "🎯 Exclusive Premium Deals",
              "⚡ Unlimited Deal Claims", 
              "🔔 Priority Notifications",
              "📱 Mobile App Access",
              "🎁 Special Member Offers"
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>

          {/* Fun Subscription Button */}
          <Button
            onClick={handleSubscribe}
            disabled={!isAuthenticated || isProcessing || saveSubscriptionMutation.isPending}
            className="w-full py-6 text-lg font-bold transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Processing Payment...
              </>
            ) : saveSubscriptionMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Activating Premium...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Subscribe Now & Save Big!
                <Zap className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>

          {!isAuthenticated && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
              Please log in to subscribe to premium features
            </p>
          )}

          {/* Security Badge */}
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-3">
            <span>🔒 Secure Payment by Razorpay</span>
            <span>•</span>
            <span>30-day money back guarantee</span>
          </div>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600 flex items-center justify-center space-x-2">
              <Crown className="h-6 w-6" />
              <span>Welcome to Premium!</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-6">
            <div className="text-6xl animate-bounce">🎉</div>
            <div className="space-y-2">
              <p className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                Subscription Activated!
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                You now have access to all premium features and exclusive deals!
              </p>
              
              {paymentResult && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                  <p>Payment ID: {paymentResult.paymentId}</p>
                  <p>Subscription ID: {paymentResult.subscriptionId}</p>
                </div>
              )}
            </div>
            
            <Button 
              onClick={() => setShowSuccessDialog(false)} 
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
            >
              <Star className="h-4 w-4 mr-2" />
              Start Exploring Premium Deals!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionButton;