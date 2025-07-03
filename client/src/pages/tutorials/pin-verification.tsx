import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { 
  Shield, 
  Users, 
  Store, 
  CheckCircle, 
  ArrowRight, 
  WifiOff, 
  Lock,
  Eye,
  MessageSquare,
  Clock,
  Star
} from "lucide-react";

export default function PinVerificationTutorial() {
  const [activeTab, setActiveTab] = useState("customer");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PIN-Based Verification Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn how our offline-friendly PIN verification system makes deal redemption simple, secure, and works anywhere
          </p>
          
          <div className="flex justify-center gap-4 mt-6">
            <Badge variant="secondary" className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              Works Offline
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Secure
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Instant
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="customer" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              For Customers
            </TabsTrigger>
            <TabsTrigger value="vendor" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              For Vendors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  How to Redeem Deals with PIN Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Eye className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">1. Claim Deal Online</h3>
                    <p className="text-gray-600 text-sm">
                      Find deals you love and click "Claim Deal" to reserve them. This creates a pending claim with no savings yet - you must visit the store to complete redemption.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">2. Visit Store</h3>
                    <p className="text-gray-600 text-sm">
                      Go to the vendor's store with your claimed deal. Make your purchase and ask them for their 4-digit verification PIN to complete the redemption.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">3. Verify PIN & Get Savings</h3>
                    <p className="text-gray-600 text-sm">
                      Enter the 4-digit PIN in the verification dialog to complete your redemption. Only verified purchases update your savings and dashboard statistics.
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Pro Tips for Customers
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Secure Two-Phase Process</p>
                        <p className="text-sm text-gray-600">Claim online first, then verify in-store for authentic savings tracking</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Real Savings Only</p>
                        <p className="text-sm text-gray-600">Only verified purchases contribute to your savings and statistics</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Anti-Fraud Protection</p>
                        <p className="text-sm text-gray-600">PIN verification prevents fake claims and ensures authentic redemptions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Accurate Tracking</p>
                        <p className="text-sm text-gray-600">Dashboard statistics reflect only genuine store visits and purchases</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendor" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-green-600" />
                  How to Set Up and Use PIN Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">1. Set Your PIN</h3>
                    <p className="text-gray-600 text-sm">
                      When creating a deal, set a unique 4-digit PIN. Make it memorable but secure.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">2. Share with Customers</h3>
                    <p className="text-gray-600 text-sm">
                      When customers visit your store for deals, provide them with your verification PIN.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">3. Track Redemptions</h3>
                    <p className="text-gray-600 text-sm">
                      Monitor deal performance and redemptions in your vendor dashboard automatically.
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Best Practices for Vendors
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Unique PINs</p>
                        <p className="text-sm text-gray-600">Use different PINs for different deals to track performance</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Train Your Staff</p>
                        <p className="text-sm text-gray-600">Ensure all staff know the current deal PINs</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">No Internet Required</p>
                        <p className="text-sm text-gray-600">PIN verification works offline, perfect for all store environments</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Instant Analytics</p>
                        <p className="text-sm text-gray-600">Real-time tracking of deal redemptions and customer engagement</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-blue-600" />
                  Updated Vendor Registration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-3">PIN-Based Verification is Now Standard</h4>
                  <p className="text-gray-700 mb-4">
                    All new vendors registering on our platform will automatically get access to PIN-based verification for their deals. 
                    This feature is included in all membership plans and provides:
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Offline deal redemption capability</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Enhanced security for deal verification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Real-time redemption tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Improved customer experience</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">What if I forget my PIN?</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Vendors can view their deal PINs in the vendor dashboard. Customers can ask the vendor for the PIN at the store.
                </p>
                
                <h4 className="font-semibold mb-2">Does this work without internet?</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Yes! PIN verification is designed to work offline. Customers can enter the PIN even without internet connection, and it will sync when connection is restored.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Can I change my PIN after creating a deal?</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Currently, PINs are set when creating deals and cannot be changed. You can create a new deal with a different PIN if needed.
                </p>
                
                <h4 className="font-semibold mb-2">Is my PIN secure?</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Yes, PINs are encrypted and only known to the vendor. The system verifies the PIN without exposing it to customers in the interface.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}