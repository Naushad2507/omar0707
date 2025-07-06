import { Link } from "wouter";
import { useEffect } from "react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: December 2024</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Our Commitment to Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              At Instoredealz, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <p>We may collect personally identifiable information, including:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Billing and payment information</li>
                  <li>Location data (city, state)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Profile information and preferences</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Non-Personal Information</h4>
                <p>We also collect non-personally identifiable information:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Browser and device information</li>
                  <li>Usage patterns and preferences</li>
                  <li>IP addresses and location data</li>
                  <li>Cookies and tracking technologies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">We use the collected information for various purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Provision:</strong> To provide, operate, and maintain our platform</li>
                <li><strong>Account Management:</strong> To manage your account and provide customer support</li>
                <li><strong>Communication:</strong> To send you updates, newsletters, and promotional materials</li>
                <li><strong>Personalization:</strong> To personalize your experience and show relevant deals</li>
                <li><strong>Analytics:</strong> To understand how our service is used and improve it</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and resolve disputes</li>
                <li><strong>Security:</strong> To protect against fraud and ensure platform security</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">With Vendors</h4>
                <p>
                  When you claim a deal, we may share necessary information with the vendor to fulfill the offer, 
                  including your name and contact details.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">With Service Providers</h4>
                <p>
                  We may share information with third-party service providers who assist us in operating our platform, 
                  conducting business, or serving users.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Legal Requirements</h4>
                <p>
                  We may disclose information if required to do so by law or in response to valid requests by public authorities.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Security Measures</h4>
                <p>We implement appropriate security measures to protect your information:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Encryption of sensitive data in transit and at rest</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Secure payment processing through certified providers</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Data Retention</h4>
                <p>
                  We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, 
                  comply with legal obligations, resolve disputes, and enforce our agreements.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your information in a machine-readable format</li>
                <li><strong>Objection:</strong> Object to processing of your information for certain purposes</li>
                <li><strong>Restriction:</strong> Request restriction of processing under certain circumstances</li>
              </ul>
              
              <p className="mt-4">
                To exercise these rights, please contact us at privacy@instoredealz.com. We will respond to your request 
                within 30 days.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Types of Cookies</h4>
                <p>We use different types of cookies:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Essential Cookies:</strong> Required for the platform to function properly</li>
                  <li><strong>Performance Cookies:</strong> Help us analyze how users interact with our platform</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and personalize your experience</li>
                  <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Cookie Management</h4>
                <p>
                  You can control cookies through your browser settings. However, disabling certain cookies may limit 
                  the functionality of our platform.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Our platform may integrate with third-party services:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Payment processors for secure transactions</li>
                <li>Analytics services to understand user behavior</li>
                <li>Communication platforms for customer support</li>
                <li>Social media platforms for account creation and sharing</li>
              </ul>
              
              <p className="mt-4">
                These third parties have their own privacy policies, and we encourage you to review them.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children under 13. If you are a parent or guardian and believe your child has provided 
                us with personal information, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
                new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this 
                Privacy Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="mt-4">
                <p><strong>Email:</strong> privacy@instoredealz.com</p>
                <p><strong>Address:</strong> Mumbai, Maharashtra, India</p>
                <p><strong>Phone:</strong> +91-9876543210</p>
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
