import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Store,
  Shield,
  Crown,
  UserPlus,
  ShoppingCart,
  BarChart3,
  Settings,
  CreditCard,
  QrCode,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface TestAccount {
  type: 'customer' | 'vendor' | 'admin' | 'superadmin';
  username: string;
  password: string;
  email: string;
  membershipTier?: string;
  description: string;
  features: string[];
}

const testAccounts: TestAccount[] = [
  {
    type: 'customer',
    username: 'customer_basic',
    password: 'customer123',
    email: 'basic@example.com',
    membershipTier: 'basic',
    description: 'Basic tier customer with limited access to deals',
    features: ['Browse deals', 'Access food & travel deals', 'Basic membership card', 'Standard support']
  },
  {
    type: 'customer',
    username: 'customer_premium',
    password: 'customer123',
    email: 'premium@example.com',
    membershipTier: 'premium',
    description: 'Premium customer with extended deal access',
    features: ['Access most deal categories', 'Enhanced QR code', 'Priority support', 'Exclusive offers']
  },
  {
    type: 'customer',
    username: 'customer_ultimate',
    password: 'customer123',
    email: 'ultimate@example.com',
    membershipTier: 'ultimate',
    description: 'Ultimate tier with full platform access',
    features: ['Access ALL deals', 'Premium QR code', 'VIP support', 'Early access', 'Premium concierge']
  },
  {
    type: 'vendor',
    username: 'vendor',
    password: 'vendor123',
    email: 'vendor@example.com',
    description: 'Fashion store vendor with multiple deals',
    features: ['Post deals', 'Track analytics', 'Manage inventory', 'Customer insights']
  },
  {
    type: 'admin',
    username: 'admin',
    password: 'admin123',
    email: 'admin@instoredealz.com',
    description: 'System administrator with management access',
    features: ['Manage users', 'Approve vendors', 'Moderate deals', 'View analytics']
  },
  {
    type: 'superadmin',
    username: 'superadmin',
    password: 'superadmin123',
    email: 'superadmin@instoredealz.com',
    description: 'Super administrator with full system access',
    features: ['Full system control', 'Admin management', 'System logs', 'All privileges']
  }
];

const testFlows = [
  {
    title: "Customer Journey",
    icon: Users,
    color: "bg-blue-500",
    steps: [
      "1. Sign up as new customer",
      "2. Browse trending deals",
      "3. Upgrade membership tier",
      "4. View digital membership card with QR code",
      "5. Claim deals and redeem",
      "6. Check claim history and savings"
    ]
  },
  {
    title: "Vendor Experience",
    icon: Store,
    color: "bg-green-500",
    steps: [
      "1. Register as vendor",
      "2. Complete business verification",
      "3. Post new deals across categories",
      "4. Track deal performance",
      "5. Manage claimed deals",
      "6. View analytics dashboard"
    ]
  },
  {
    title: "Admin Operations",
    icon: Shield,
    color: "bg-purple-500",
    steps: [
      "1. Login as admin",
      "2. Review pending vendors",
      "3. Approve/reject deals",
      "4. Manage user accounts",
      "5. Monitor platform activity",
      "6. Generate reports"
    ]
  }
];

export default function TestFlows() {
  const [copiedAccount, setCopiedAccount] = useState<string>("");

  const copyCredentials = (account: TestAccount) => {
    const credentials = `Username: ${account.username}\nPassword: ${account.password}\nEmail: ${account.email}`;
    navigator.clipboard.writeText(credentials);
    setCopiedAccount(account.username);
    setTimeout(() => setCopiedAccount(""), 2000);
  };

  const getTierBadge = (tier?: string) => {
    if (!tier) return null;
    
    const tierColors = {
      basic: "bg-gray-100 text-gray-800",
      premium: "bg-blue-100 text-blue-800",
      ultimate: "bg-purple-100 text-purple-800"
    };

    return (
      <Badge className={tierColors[tier as keyof typeof tierColors]}>
        {tier.toUpperCase()}
      </Badge>
    );
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'customer': return Users;
      case 'vendor': return Store;
      case 'admin': return Shield;
      case 'superadmin': return Crown;
      default: return Users;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Instoredealz Test Experience
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Complete testing flows for all user roles with secure digital membership features
            </p>
            
            {/* Key Features */}
            <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-card p-4 rounded-lg shadow-sm">
                <QrCode className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Secure QR Codes</p>
              </div>
              <div className="bg-card p-4 rounded-lg shadow-sm">
                <CreditCard className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Digital Membership</p>
              </div>
              <div className="bg-card p-4 rounded-lg shadow-sm">
                <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium">OTP Access</p>
              </div>
              <div className="bg-card p-4 rounded-lg shadow-sm">
                <BarChart3 className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Real-time Analytics</p>
              </div>
            </div>
          </div>

          {/* Test Accounts */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Test Accounts</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {testAccounts.map((account, index) => {
                const Icon = getAccountIcon(account.type);
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            account.type === 'customer' ? 'bg-blue-100 text-blue-600' :
                            account.type === 'vendor' ? 'bg-green-100 text-green-600' :
                            account.type === 'admin' ? 'bg-purple-100 text-purple-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg capitalize">{account.type}</CardTitle>
                            {account.membershipTier && getTierBadge(account.membershipTier)}
                          </div>
                        </div>
                        <Button 
                          onClick={() => copyCredentials(account)}
                          variant="outline" 
                          size="sm"
                        >
                          {copiedAccount === account.username ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            "Copy Login"
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{account.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="font-medium">Username:</span>
                          <p className="font-mono text-xs">{account.username}</p>
                        </div>
                        <div>
                          <span className="font-medium">Password:</span>
                          <p className="font-mono text-xs">{account.password}</p>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Features Available:</h4>
                        <div className="space-y-1">
                          {account.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-sm">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Test Flows */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Complete Test Flows</h2>
            <div className="grid lg:grid-cols-3 gap-6">
              {testFlows.map((flow, index) => {
                const Icon = flow.icon;
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${flow.color} text-white`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <CardTitle>{flow.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {flow.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-sm text-gray-700 flex-1">{step.substring(3)}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sample Data Info */}
          <div className="bg-card rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Sample Data Overview</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">10</div>
                <p className="text-sm text-muted-foreground">Test Vendors</p>
                <p className="text-xs text-gray-500">Across all categories</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">80+</div>
                <p className="text-sm text-muted-foreground">Sample Deals</p>
                <p className="text-xs text-gray-500">5-10 per category</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">20+</div>
                <p className="text-sm text-muted-foreground">Test Users</p>
                <p className="text-xs text-gray-500">All membership tiers</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">50+</div>
                <p className="text-sm text-muted-foreground">Deal Claims</p>
                <p className="text-xs text-gray-500">Various statuses</p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-3">Deal Categories</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>• Electronics</div>
                  <div>• Fashion</div>
                  <div>• Restaurants</div>
                  <div>• Travel</div>
                  <div>• Health & Beauty</div>
                  <div>• Home & Garden</div>
                  <div>• Automotive</div>
                  <div>• Entertainment</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Security Features</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Secure QR code generation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Membership tier verification</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>One-time access OTP</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Deal access control</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}