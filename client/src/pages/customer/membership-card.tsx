import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import MembershipCardDigital from "@/components/ui/membership-card-digital";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { 
  Download, 
  Share2, 
  Smartphone, 
  Wallet,
  CreditCard,
  Star,
  TrendingUp,
  Gift,
  Clock,
  Loader2
} from "lucide-react";

export default function MembershipCardPage() {
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: claims, isLoading: claimsLoading } = useQuery({
    queryKey: ["/api/users/claims"],
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please login to view your membership card
          </h1>
        </div>
        <Footer />
      </div>
    );
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    // Simulate download process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsDownloading(false);
    // In a real app, this would generate and download the card image
    alert("Card downloaded to your device!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Instoredealz Membership Card',
          text: 'Check out my membership card!',
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("Card link copied to clipboard!");
    }
  };

  // Generate membership ID based on user info
  const membershipId = `ID${user.id.toString().padStart(4, '0')}-IND-${user.city?.substring(0, 3).toUpperCase() || 'MUM'}`;
  
  // Calculate membership dates
  const validFrom = new Date().toISOString();
  const validUntil = user.membershipExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Digital Membership Card
          </h1>
          <p className="text-gray-600">
            Show this card at participating stores to claim your exclusive deals
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Membership Card */}
          <div className="space-y-6">
            <MembershipCardDigital
              name={user.name}
              membershipId={membershipId}
              membershipPlan={user.membershipPlan || 'basic'}
              city={user.city || 'Mumbai'}
              validFrom={validFrom}
              validUntil={validUntil}
              userId={user.id}
              className="shadow-2xl"
            />

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleDownload} 
                className="flex items-center justify-center"
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isDownloading ? 'Downloading...' : 'Download Card'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleShare}
                className="flex items-center justify-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Card
              </Button>
            </div>

            {/* Usage Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Smartphone className="h-5 w-5 mr-2" />
                  How to Use Your Card
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Show at Store</p>
                    <p className="text-sm text-gray-600">Present this digital card at any participating store</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Scan QR Code</p>
                    <p className="text-sm text-gray-600">Store staff will scan the QR code to verify your membership</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Claim Deal</p>
                    <p className="text-sm text-gray-600">Enjoy exclusive discounts and deals automatically applied</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Membership Stats & Info */}
          <div className="space-y-6">
            
            {/* Membership Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Membership Status
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Plan</p>
                    <p className="font-semibold capitalize">{user.membershipPlan || 'Basic'} Member</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-semibold">Jan 2024</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Valid Until</p>
                  <p className="font-semibold">
                    {new Date(validUntil).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Savings Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Your Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{user.totalSavings || '2,450'}
                    </div>
                    <p className="text-sm text-gray-600">Total Saved</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {user.dealsClaimed || claims?.length || 12}
                    </div>
                    <p className="text-sm text-gray-600">Deals Claimed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Membership Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 mr-2" />
                  Membership Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Exclusive member-only deals</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Early access to new offers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Birthday special discounts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Priority customer support</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            {!claimsLoading && claims && claims.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {claims.slice(0, 3).map((claim: any, index: number) => (
                      <div key={claim.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Deal claimed
                        </span>
                        <span className="font-medium text-green-600">
                          Saved ₹{claim.savingsAmount}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Add to Wallet Section */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="text-center">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Add to Digital Wallet
              </h3>
              <p className="text-gray-600 mb-4">
                Add your membership card to your phone's digital wallet for quick access
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" size="sm">
                  Add to Apple Wallet
                </Button>
                <Button variant="outline" size="sm">
                  Add to Google Pay
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}