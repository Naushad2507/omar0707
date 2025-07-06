import { Link } from "wouter";
import { useEffect } from "react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms & Conditions</h1>
          <p className="text-muted-foreground">Last updated: December 2024</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <p>
              By accessing or using Instoredealz ("the Service"), you agree to be bound by these Terms and Conditions ("Terms"). 
              If you disagree with any part of these terms, then you may not access the Service.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Use License</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Permission is granted to temporarily use Instoredealz for:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Personal, non-commercial transitory viewing only</li>
                  <li>Discovering and claiming legitimate deals from verified vendors</li>
                  <li>Accessing membership benefits according to your plan</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">This license shall automatically terminate if you violate any of these restrictions:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for commercial purposes or public display</li>
                  <li>Attempt to reverse engineer any software contained on the website</li>
                  <li>Remove any copyright or other proprietary notations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Registration</h4>
                <p>
                  To access certain features of the Service, you must register for an account. You agree to provide accurate, 
                  current, and complete information during registration and to update such information to keep it accurate, 
                  current, and complete.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Account Security</h4>
                <p>
                  You are responsible for safeguarding the password and for maintaining the confidentiality of your account. 
                  You agree not to disclose your password to any third party and to take sole responsibility for activities 
                  that occur under your account.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Membership Plans</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Promotional Offers</h4>
                <p>
                  The 1-year free Premium plan offer (valid until August 14, 2026) is available only to new users who 
                  register between August 15, 2025, and August 14, 2026. This promotional period automatically expires 
                  on August 14, 2026, after which standard pricing applies.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Subscription Terms</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Annual subscriptions are billed yearly in advance</li>
                  <li>Prices are subject to change with 30 days notice</li>
                  <li>Refunds are available within 14 days of purchase</li>
                  <li>Unused benefits do not roll over between billing periods</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deal Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Deal Validity</h4>
                <p>
                  All deals are subject to vendor terms and conditions. Instoredealz  acts solely as a platform to connect 
                  users with vendor offers and is not liable for the execution, availability, or outcome of vendor deals.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Deal Limitations</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Discounts apply to the total bill value, as specified in each deal</li>
                  <li>Deals may be claimed multiple times unless a vendor sets specified limitations</li>
                  <li>Deals cannot be combined with other offers</li>
                  <li>Claimed deals must be used within the validity period</li>
                  <li>Deals are non-transferable and non-refundable</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Deal Creation</h4>
                <p>
                  Vendors are responsible for creating accurate deal descriptions, discount   terms, 
                  and honoring all claimed deals according to the specified conditions. Honoring all valid redemption by verified instoredealz subscribers.
                  
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Business Verification</h4>
                <p>
                  All vendor accounts must provide valid business registration details including GST and PAN 
                  information where applicable. False information may result in account suspension.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prohibited Uses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">You may not use our Service:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, 
                Instoredealz excludes all representations, warranties, conditions, and terms (whether express or implied by statute, 
                common law, or otherwise) except for those explicitly set out in the Terms and Conditions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitations</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                In no event shall Instoredealz or its suppliers be liable for any damages (including, without limitation, 
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                to use the materials on Instoredealz's website, even if Instoredealz or an authorized representative has 
                been notified orally or in writing of the possibility of such damage.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="mt-4 space-y-2">
                <p><strong>Company:</strong> QuantumQuirk EcomFlow Private Limited</p>
                <p><strong>Email:</strong> support@instoredealz.com</p>
                <p><strong>Phone:</strong> 90044 08584</p>
                <p><strong>Address:</strong> Mumbai, Maharashtra, India</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Link to="/" className="text-primary hover:underline">
            Back to Home
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
