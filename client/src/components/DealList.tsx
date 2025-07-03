import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { generateDealClaimQR } from '../lib/qr-code';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Gift, Star, MapPin, Calendar, QrCode, Calculator, Receipt } from 'lucide-react';

interface Deal {
  id: number;
  title: string;
  description: string;
  category: string;
  originalPrice: string;
  discountedPrice: string;
  discountPercentage: number;
  validUntil: string;
  vendor: {
    id: number;
    name: string;
    city: string;
    state: string;
  };
  isActive: boolean;
  maxRedemptions?: number;
  currentRedemptions?: number;
}

interface ClaimResponse {
  id: number;
  dealId: number;
  userId: number;
  savingsAmount: string;
  claimedAt: string;
}

const DealList = () => {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [billingDeal, setBillingDeal] = useState<Deal | null>(null);
  const [billAmount, setBillAmount] = useState<string>('');
  const [calculatedSavings, setCalculatedSavings] = useState<number>(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch deals using TanStack Query
  const { data: deals = [], isLoading, error } = useQuery<Deal[]>({
    queryKey: ['/api/deals'],
  });

  // Calculate savings based on bill amount
  const calculateSavings = (billAmountValue: string, discountPercentage: number) => {
    const amount = parseFloat(billAmountValue);
    if (isNaN(amount) || amount <= 0) return 0;
    return (amount * discountPercentage) / 100;
  };

  // Update bill amount mutation
  const updateBillMutation = useMutation({
    mutationFn: async ({ dealId, billAmount, savings }: { dealId: number, billAmount: number, savings: number }) => {
      return apiRequest('POST', `/api/deals/${dealId}/update-bill`, {
        billAmount,
        actualSavings: savings
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Bill Updated Successfully!",
        description: `Your actual savings of ₹${calculatedSavings.toFixed(2)} have been recorded.`,
        variant: "default",
      });
      
      // Reset and close billing dialog
      setBillingDeal(null);
      setBillAmount('');
      setCalculatedSavings(0);
      
      // Refresh user data to update dashboard
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/claims"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update bill amount. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Claim deal mutation
  const claimMutation = useMutation({
    mutationFn: async (dealId: number) => {
      return apiRequest('POST', `/api/deals/${dealId}/claim`);
    },
    onSuccess: async (claimData: any, dealId) => {
      // Generate QR code for the claim
      try {
        const qrCodeImage = await generateDealClaimQR(dealId, claimData.id);
        setQrCode(qrCodeImage);
        
        toast({
          title: "Deal Claimed Successfully!",
          description: `Deal claimed! Visit store to redeem and calculate your actual savings.`,
          variant: "default",
        });
        
        // Comprehensive data refresh to update user profile and deal listings
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['/api/deals'] }),
          queryClient.invalidateQueries({ queryKey: ["/api/users/claims"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] }),
        ]);
        
        // Force refetch user data to update dashboard statistics
        queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });
      } catch (qrError) {
        console.error('Error generating QR code:', qrError);
        toast({
          title: "Deal Claimed Successfully!",
          description: `You saved ₹${claimData.savingsAmount}! (QR code generation failed)`,
          variant: "default",
        });
        
        // Comprehensive data refresh even if QR generation fails
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['/api/deals'] }),
          queryClient.invalidateQueries({ queryKey: ["/api/users/claims"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] }),
        ]);
        
        queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Claim Deal",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClaimDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setQrCode(null);
    claimMutation.mutate(deal.id);
  };

  const handleDealClick = (dealId: number) => {
    setLocation(`/deals/${dealId}`);
  };

  const closeDialog = () => {
    setSelectedDeal(null);
    setQrCode(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Loading amazing deals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h3 className="text-xl font-semibold text-red-600">Oops! Something went wrong</h3>
          <p className="text-muted-foreground">{(error as Error).message}</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/deals'] })}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🔥 Hot Deals
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover amazing discounts and save money on your favorite products!
        </p>
      </div>
      
      {deals.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-8xl mb-4">🛍️</div>
          <h3 className="text-xl font-semibold mb-2">No deals available</h3>
          <p className="text-muted-foreground">Check back later for amazing offers!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {deals.map((deal) => {
            const isExpired = new Date(deal.validUntil) < new Date();
            const isLimitReached = deal.maxRedemptions && deal.currentRedemptions && 
              deal.currentRedemptions >= deal.maxRedemptions;
            const canClaim = deal.isActive && !isExpired && !isLimitReached;
            
            return (
              <Card 
                key={deal.id} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20 cursor-pointer"
                onClick={() => handleDealClick(deal.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {deal.category}
                    </Badge>
                    <div className="flex items-center space-x-1 text-orange-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{deal.discountPercentage}% OFF</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {deal.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {deal.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-green-600">
                          ₹{deal.discountedPrice}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{deal.originalPrice}
                        </span>
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        Save ₹{(parseFloat(deal.originalPrice) - parseFloat(deal.discountedPrice)).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {deal.vendor ? 
                          `${deal.vendor.name || 'Vendor'} - ${deal.vendor.city}, ${deal.vendor.state}` : 
                          'Location not available'
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Valid until {new Date(deal.validUntil).toLocaleDateString()}</span>
                    </div>
                    {deal.maxRedemptions && (
                      <div className="flex items-center space-x-2">
                        <Gift className="h-4 w-4" />
                        <span>{deal.currentRedemptions || 0}/{deal.maxRedemptions} claimed</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClaimDeal(deal);
                    }}
                    disabled={!canClaim || claimMutation.isPending}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                  >
                    {claimMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Claiming...
                      </>
                    ) : !canClaim ? (
                      isExpired ? "⏰ Expired" : 
                      isLimitReached ? "🚫 Limit Reached" : 
                      "❌ Unavailable"
                    ) : (
                      <>
                        <Gift className="h-4 w-4 mr-2" />
                        🎉 Claim Deal
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBillingDeal(deal);
                    }}
                    variant="outline"
                    className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
                    size="sm"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Add Bill Amount
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={!!selectedDeal && !!qrCode} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">
              🎉 Deal Claimed Successfully!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your deal has been claimed. Show this QR code to the vendor to redeem your discount.
            </DialogDescription>
          </DialogHeader>
          
          {qrCode && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                <img 
                  src={qrCode} 
                  alt="Deal Claim QR Code" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="font-semibold text-lg">{selectedDeal?.title}</p>
                <p className="text-sm text-muted-foreground">
                  Present this QR code at {selectedDeal?.vendor.name}
                </p>
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <QrCode className="h-4 w-4" />
                  <span className="text-sm font-medium">Scan to verify claim</span>
                </div>
              </div>
              <Button onClick={closeDialog} className="w-full">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bill Amount Dialog */}
      <Dialog open={!!billingDeal} onOpenChange={() => setBillingDeal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-orange-600" />
              Calculate Your Savings
            </DialogTitle>
            <DialogDescription>
              Enter the total bill amount to calculate your actual savings
            </DialogDescription>
          </DialogHeader>
          
          {billingDeal && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-1">{billingDeal.title}</h3>
                <p className="text-sm text-gray-600">Discount: {billingDeal.discountPercentage}% OFF</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bill-amount">Total Bill Amount (₹)</Label>
                <Input
                  id="bill-amount"
                  type="number"
                  placeholder="Enter your total bill amount"
                  value={billAmount}
                  onChange={(e) => {
                    setBillAmount(e.target.value);
                    const savings = calculateSavings(e.target.value, billingDeal.discountPercentage);
                    setCalculatedSavings(savings);
                  }}
                  className="text-lg"
                />
              </div>
              
              {billAmount && calculatedSavings > 0 && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">Your Savings:</span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{calculatedSavings.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {billingDeal.discountPercentage}% off ₹{billAmount}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setBillingDeal(null);
                    setBillAmount('');
                    setCalculatedSavings(0);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (calculatedSavings > 0) {
                      updateBillMutation.mutate({
                        dealId: billingDeal.id,
                        billAmount: parseFloat(billAmount),
                        savings: calculatedSavings
                      });
                    }
                  }}
                  disabled={!billAmount || calculatedSavings <= 0 || updateBillMutation.isPending}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  {updateBillMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Receipt className="h-4 w-4 mr-2" />
                      Record Savings
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DealList;