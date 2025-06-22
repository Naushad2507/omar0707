import { useState } from "react";
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
      answer: "Click on any deal card, then click 'View Deal Details' to see complete information. Click 'Claim Deal' to get your discount code, which you can use at the vendor's location."
    },
    {
      id: 3,
      category: "deals",
      question: "Why can't I see discount codes?",
      answer: "Discount codes are available to Premium and Ultimate members. Basic members need to upgrade their membership to access exclusive discount codes."
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
      answer: "Use high-quality images, clear descriptions, attractive discount percentages, and set reasonable validity periods. Monitor analytics to optimize performance."
    },
    {
      id: 13,
      category: "payment",
      question: "How does vendor payment work?",
      answer: "We operate on a commission-based model. You only pay when customers successfully redeem deals, ensuring you get real value for your investment."
    },
    {
      id: 14,
      category: "deals",
      question: "Can I edit deals after approval?",
      answer: "Yes, you can edit deal details, but major changes may require re-approval. You can activate/deactivate deals anytime from your dashboard."
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 mb-8">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Interactive Tutorials</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Customer Tutorial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
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
                <p className="text-gray-600 mb-4">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
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
                    <CardTitle className="text-lg font-medium text-gray-900 flex-1">
                      {faq.question}
                    </CardTitle>
                    <Badge variant="outline" className="ml-4 text-xs">
                      {categories.find(c => c.id === faq.category)?.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or browse different categories.
              </p>
            </div>
          )}
        </div>

        <Separator className="my-12" />

        {/* Contact Support Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Support</h2>
          <p className="text-gray-600 mb-8">
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
                    <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                    <p className="font-medium text-gray-900 mb-2">{method.contact}</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Help Topics</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "How to claim your first deal",
              "Understanding membership benefits",
              "Vendor registration process",
              "Payment and billing questions",
              "Account security settings",
              "Managing your wishlist"
            ].map((topic, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-gray-700">{topic}</span>
                <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}