import { useState, useEffect } from "react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import Tutorial from "@/components/ui/tutorial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  MessageCircle, 
  Mail, 
  Phone, 
  HelpCircle, 
  BookOpen, 
  Users, 
  Store, 
  CreditCard, 
  Shield, 
  Settings,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle
} from "lucide-react";

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    { id: "all", name: "All Topics", icon: HelpCircle },
    { id: "getting-started", name: "Getting Started", icon: BookOpen },
    { id: "deals", name: "Deals & Discounts", icon: Store },
    { id: "membership", name: "Membership", icon: Users },
    { id: "payment", name: "Payment & Billing", icon: CreditCard },
    { id: "account", name: "Account Settings", icon: Settings },
    { id: "security", name: "Security & Privacy", icon: Shield },
  ];

  const faqs = [
    {
      id: 1,
      category: "getting-started",
      question: "How do I start using Instoredealz?",
      answer: "Sign up for a free account, complete your profile, and start browsing deals in your city. You can claim deals immediately with our promotional membership plan."
    },
    {
      id: 2,
      category: "deals",
      question: "How do I claim a deal?",
      answer: "Claiming deals is a secure two-step process: 1) Click 'Claim Deal' online to reserve it, 2) Visit the store and ask for the 4-digit PIN to verify your redemption in the app. Only verified redemptions count toward your savings."
    },
    {
      id: 3,
      category: "deals",
      question: "How does PIN verification work?",
      answer: "After claiming a deal online, visit the store and ask for the 4-digit PIN. Enter it in the app to verify your redemption. This prevents fake claims and ensures you actually visit the store to get your savings."
    },
    {
      id: 4,
      category: "membership",
      question: "What's included in the free promotional plan?",
      answer: "New users get a full year of Premium features free, including exclusive deals, discount codes, digital membership card, and priority support."
    },
    {
      id: 5,
      category: "membership",
      question: "How do I upgrade my membership?",
      answer: "Go to the Pricing page and select your preferred plan. You can upgrade anytime and get immediate access to premium features."
    },
    {
      id: 6,
      category: "deals",
      question: "Can I save deals for later?",
      answer: "Yes! Click the heart icon on any deal to add it to your wishlist. Access your saved deals from your dashboard anytime."
    },
    {
      id: 15,
      category: "deals", 
      question: "What happens if I claim a deal but don't visit the store?",
      answer: "Claimed deals that aren't verified with PIN remain in 'pending' status and don't count toward your savings or statistics. You must visit the store and verify the PIN to complete the redemption and get actual savings."
    },
    {
      id: 16,
      category: "deals",
      question: "Do I need internet to verify a PIN?",
      answer: "No! PIN verification works offline. You can enter the PIN even without internet connection, and it will sync when connection is restored. This makes verification convenient at any store location."
    },
    {
      id: 7,
      category: "account",
      question: "How do I change my location?",
      answer: "Go to your account settings and update your city and state. This helps us show you deals from nearby vendors."
    },
    {
      id: 8,
      category: "payment",
      question: "Are there any hidden fees?",
      answer: "No hidden fees! Our Basic plan is completely free, and Premium/Ultimate plans have transparent monthly pricing with no additional charges."
    },
    {
      id: 9,
      category: "security",
      question: "Is my personal information safe?",
      answer: "Yes, we use industry-standard encryption and security measures to protect your data. We never share your personal information with third parties."
    },
    {
      id: 10,
      category: "getting-started",
      question: "How do vendors get approved?",
      answer: "Vendors submit their business registration and details. Our team reviews applications within 24-48 hours to ensure quality and authenticity."
    }
  ];

  const vendorFaqs = [
    {
      id: 11,
      category: "getting-started",
      question: "How do I become a vendor?",
      answer: "Register as a vendor by providing your business details, GST number, and business registration. After approval, you can start creating deals."
    },
    {
      id: 12,
      category: "deals",
      question: "How do I create effective deals?",
      answer: "Use high-quality images, clear descriptions, attractive discount percentages, set reasonable validity periods, and create a unique 4-digit PIN for secure verification. Monitor analytics to optimize performance."
    },
    {
      id: 13,
      category: "deals",
      question: "How does the PIN verification system work for vendors?",
      answer: "When creating deals, you set a unique 4-digit PIN. When customers visit your store with claimed deals, provide them the PIN so they can verify their redemption. Only PIN-verified redemptions count toward analytics and customer savings."
    },
    {
      id: 14,
      category: "deals",
      question: "Can I edit deals after approval?",
      answer: "Yes, you can edit deal details, but major changes may require re-approval. You can activate/deactivate deals anytime from your dashboard."
    },
    {
      id: 17,
      category: "deals",
      question: "What if customers claim deals but don't visit my store?",
      answer: "No problem! The two-phase system protects you. Customers can claim deals online, but they must visit your store and verify with the PIN to complete redemption. Unverified claims don't count as completed sales."
    },
    {
      id: 18,
      category: "deals",
      question: "How do I track which customers have verified deals?",
      answer: "Your vendor dashboard shows real-time analytics of claimed vs verified deals. You can see which customers completed the verification process and actually visited your store."
    }
  ];

  const allFaqs = [...faqs, ...vendorFaqs];
  
  const filteredFaqs = allFaqs.filter(faq => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email",
      contact: "support@instoredealz.com",
      responseTime: "24-48 hours"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Available in app",
      responseTime: "Usually within 1 hour"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak with our team",
      contact: "90044 08584",
      responseTime: "Mon-Fri, 9 AM - 6 PM IST"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Get answers to your questions and learn how to make the most of Instoredealz
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search for help articles, tutorials, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3 text-lg"
            />
          </div>
        </div>

        {/* Tutorials Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Interactive Tutorials</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Customer Tutorial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Learn how to browse deals, claim discounts, manage your wishlist, and get the most savings.
                </p>
                <Tutorial type="customer" />
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="h-5 w-5 mr-2 text-success" />
                  Vendor Tutorial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Discover how to create deals, manage your business profile, track analytics, and grow your customer base.
                </p>
                <Tutorial type="vendor" />
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-12" />

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </Button>
              );
            })}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <Card key={faq.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-medium text-foreground flex-1">
                      {faq.question}
                    </CardTitle>
                    <Badge variant="outline" className="ml-4 text-xs">
                      {categories.find(c => c.id === faq.category)?.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse different categories.
              </p>
            </div>
          )}
        </div>

        <Separator className="my-12" />

        {/* Contact Support Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Contact Support</h2>
          <p className="text-muted-foreground mb-8">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method) => {
              const Icon = method.icon;
              return (
                <Card key={method.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{method.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                    <p className="font-medium text-foreground mb-2">{method.contact}</p>
                    <div className="flex items-center justify-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {method.responseTime}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gradient-to-br from-primary/5 to-royal/5 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Popular Help Topics</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "How to claim your first deal", anchor: "claiming-deals" },
              { title: "Understanding membership benefits", anchor: "membership" },
              { title: "Vendor registration process", anchor: "vendor-registration" },
              { title: "Payment and billing questions", anchor: "payment" },
              { title: "Account security settings", anchor: "security" },
              { title: "Managing your wishlist", anchor: "wishlist" }
            ].map((topic, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3 p-3 bg-card rounded-lg hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
                onClick={() => {
                  const element = document.getElementById(topic.anchor);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-foreground">{topic.title}</span>
                <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Help Sections */}
        <div className="space-y-12 mt-16">
          {/* Claiming Deals */}
          <div id="claiming-deals" className="bg-card rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center">
              <Store className="h-8 w-8 mr-3 text-primary" />
              How to Claim Your First Deal
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-4">
                Getting started with Instoredealz is easy! Follow these simple steps to claim your first deal:
              </p>
              <ol className="space-y-3">
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">1</span>
                  <span>Browse available deals on our homepage or use the search function</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">2</span>
                  <span>Click on a deal you're interested in to view full details</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">3</span>
                  <span>Click "Claim Deal" button (requires login)</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">4</span>
                  <span>Visit the store and verify your PIN to complete the redemption</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Membership Benefits */}
          <div id="membership" className="bg-card rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center">
              <Users className="h-8 w-8 mr-3 text-primary" />
              Understanding Membership Benefits
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-muted rounded-lg p-6 border">
                  <h3 className="font-bold text-lg mb-2 text-foreground">Basic</h3>
                  <p className="text-muted-foreground">Free access to standard deals</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-muted rounded-lg p-6 border border-purple-200 dark:border-purple-700">
                  <h3 className="font-bold text-lg mb-2 text-foreground">Premium</h3>
                  <p className="text-muted-foreground">Access to exclusive premium deals and early access</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-muted rounded-lg p-6 border border-amber-200 dark:border-amber-700">
                  <h3 className="font-bold text-lg mb-2 text-foreground">Ultimate</h3>
                  <p className="text-muted-foreground">All premium features plus VIP support and special offers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Registration */}
          <div id="vendor-registration" className="bg-card rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center">
              <Store className="h-8 w-8 mr-3 text-primary" />
              Vendor Registration Process
            </h2>
            <p className="text-muted-foreground mb-6">
              Join our vendor network and start promoting your business to thousands of customers:
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-lg mb-3">Registration Steps:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Create vendor account</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Submit business details</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Wait for approval</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Start creating deals</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-3">Required Documents:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center"><HelpCircle className="h-4 w-4 text-blue-500 mr-2" />Business license</li>
                  <li className="flex items-center"><HelpCircle className="h-4 w-4 text-blue-500 mr-2" />GST registration</li>
                  <li className="flex items-center"><HelpCircle className="h-4 w-4 text-blue-500 mr-2" />PAN card</li>
                  <li className="flex items-center"><HelpCircle className="h-4 w-4 text-blue-500 mr-2" />Address proof</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment & Billing */}
          <div id="payment" className="bg-card rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center">
              <CreditCard className="h-8 w-8 mr-3 text-primary" />
              Payment and Billing Questions
            </h2>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">How do I upgrade my membership?</h4>
                <p className="text-muted-foreground">Visit your profile page and click on "Upgrade Membership" to choose from Premium or Ultimate plans.</p>
              </div>
              <div>
                <h4 className="font-semibold">What payment methods are accepted?</h4>
                <p className="text-muted-foreground">We accept all major credit cards, debit cards, UPI, and digital wallets through our secure payment gateway.</p>
              </div>
              <div>
                <h4 className="font-semibold">Can I cancel my subscription?</h4>
                <p className="text-muted-foreground">Yes, you can cancel anytime from your account settings. Your membership will remain active until the billing period ends.</p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div id="security" className="bg-card rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-primary" />
              Account Security Settings
            </h2>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Password Security</h4>
                <p className="text-muted-foreground">Use a strong password with at least 8 characters, including numbers and special characters.</p>
              </div>
              <div>
                <h4 className="font-semibold">Account Protection</h4>
                <p className="text-muted-foreground">Never share your login credentials. Log out from shared devices and monitor your account activity regularly.</p>
              </div>
              <div>
                <h4 className="font-semibold">Data Privacy</h4>
                <p className="text-muted-foreground">We protect your personal information with industry-standard encryption and never share it with unauthorized parties.</p>
              </div>
            </div>
          </div>

          {/* Wishlist Management */}
          <div id="wishlist" className="bg-card rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center">
              <BookOpen className="h-8 w-8 mr-3 text-primary" />
              Managing Your Wishlist
            </h2>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Adding to Wishlist</h4>
                <p className="text-muted-foreground">Click the heart icon on any deal card to add it to your wishlist for easy access later.</p>
              </div>
              <div>
                <h4 className="font-semibold">Viewing Your Wishlist</h4>
                <p className="text-muted-foreground">Access your saved deals anytime from the "My Wishlist" section in your account dashboard.</p>
              </div>
              <div>
                <h4 className="font-semibold">Wishlist Notifications</h4>
                <p className="text-muted-foreground">Get notified when deals on your wishlist are about to expire or when similar deals become available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}