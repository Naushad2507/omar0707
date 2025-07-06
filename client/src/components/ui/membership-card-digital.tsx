import { useState } from "react";
import { generateMembershipQR } from "@/lib/qr-code";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import InstoredeelzLogo from "@/components/ui/instoredealz-logo";
import { 
  User, 
  Calendar, 
  MapPin, 
  QrCode, 
  Star, 
  Shield, 
  Crown, 
  Copy, 
  Download, 
  Eye, 
  EyeOff,
  Wallet,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Clock,
  RotateCcw
} from "lucide-react";

interface MembershipCardProps {
  name: string;
  membershipId: string;
  membershipPlan: string;
  city: string;
  validFrom: string;
  validUntil: string;
  profileImage?: string;
  userId: number;
  className?: string;
  totalSavings?: string;
  dealsClaimed?: number;
  isActive?: boolean;
  showControls?: boolean;
}

export default function MembershipCardDigital({
  name,
  membershipId,
  membershipPlan,
  city,
  validFrom,
  validUntil,
  profileImage,
  userId,
  className = "",
  totalSavings = "0",
  dealsClaimed = 0,
  isActive = true,
  showControls = false,
}: MembershipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const qrCode = generateMembershipQR(userId, membershipId);

  // Helper functions
  const formatSavings = (savings: string) => {
    const amount = parseFloat(savings);
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toFixed(0)}`;
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadCard = () => {
    toast({
      title: "Download started",
      description: "Your membership card is being prepared for download",
    });
  };

  // Modern gradient backgrounds based on membership tier
  const getCardBackground = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'premium':
        return 'bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800';
      case 'ultimate':
        return 'bg-gradient-to-br from-slate-900 via-gray-900 to-black';
      case 'gold':
        return 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500';
      case 'platinum':
        return 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600';
      default:
        return 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800';
    }
  };

  const getMembershipColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'premium':
        return 'text-purple-100';
      case 'ultimate':
        return 'text-gray-100';
      case 'gold':
        return 'text-amber-900';
      case 'platinum':
        return 'text-gray-800';
      default:
        return 'text-blue-100';
    }
  };

  const getBadgeStyle = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'premium':
        return 'bg-purple-500/20 text-purple-100 border-purple-400/30';
      case 'ultimate':
        return 'bg-gray-500/20 text-gray-100 border-gray-400/30';
      case 'gold':
        return 'bg-amber-500/20 text-amber-900 border-amber-600/30';
      case 'platinum':
        return 'bg-gray-400/20 text-gray-800 border-gray-600/30';
      default:
        return 'bg-blue-500/20 text-blue-100 border-blue-400/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card className={`relative overflow-hidden w-full max-w-md mx-auto ${className}`}>
      {/* Card Background with Gradient */}
      <div className={`${getCardBackground(membershipPlan)} p-6 text-white relative`}>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className="absolute inset-0 bg-card rounded-full transform translate-x-16 -translate-y-16"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-24 h-24 opacity-5">
          <div className="absolute inset-0 bg-card rounded-full transform -translate-x-12 translate-y-12"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center mb-2">
            <InstoredeelzLogo size="md" className="text-white" />
          </div>
          <div className="text-2xl font-bold tracking-wider">
            MEMBERSHIP CARD
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
          
          {/* Left Column - User Info */}
          <div className="space-y-4">
            <div>
              <div className="text-sm opacity-80 mb-1">Name:</div>
              <div className="text-lg font-semibold">{name}</div>
            </div>

            <div>
              <div className="text-sm opacity-80 mb-1">Membership ID:</div>
              <div className="text-sm font-mono font-medium break-all">{membershipId}</div>
            </div>

            <div>
              <Badge className={`${getBadgeStyle(membershipPlan)} text-sm font-semibold px-3 py-1`}>
                {membershipPlan.charAt(0).toUpperCase() + membershipPlan.slice(1)} Member
              </Badge>
            </div>

            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-1 opacity-80" />
              <span>City: {city}</span>
            </div>

            <div className="text-sm">
              <div className="flex items-center opacity-80 mb-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Valid:</span>
              </div>
              <div className="font-medium">
                {formatDate(validFrom)} - {formatDate(validUntil)}
              </div>
            </div>
          </div>

          {/* Right Column - Profile & QR */}
          <div className="flex flex-col items-center space-y-4">
            
            {/* Profile Image */}
            <div className="w-20 h-20 rounded-full overflow-hidden bg-card/20 backdrop-blur-sm border-2 border-white/30">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-10 w-10 text-white/60" />
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="bg-card p-3 rounded-lg shadow-lg">
              <div 
                className="w-24 h-24 bg-center bg-no-repeat bg-contain"
                style={{ backgroundImage: `url("${qrCode}")` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats & Status Section */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            {/* Total Savings */}
            <div className="space-y-1">
              <div className="flex items-center justify-center text-white/80">
                <Wallet className="h-3 w-3 mr-1" />
              </div>
              <div className="text-lg font-bold">{formatSavings(totalSavings)}</div>
              <div className="text-xs opacity-80">Total Saved</div>
            </div>

            {/* Deals Claimed */}
            <div className="space-y-1">
              <div className="flex items-center justify-center text-white/80">
                <TrendingUp className="h-3 w-3 mr-1" />
              </div>
              <div className="text-lg font-bold">{dealsClaimed}</div>
              <div className="text-xs opacity-80">Deals Used</div>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <div className="flex items-center justify-center text-white/80">
                {isActive ? (
                  <CheckCircle className="h-3 w-3 text-green-300" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-300" />
                )}
              </div>
              <div className={`text-sm font-bold ${isActive ? 'text-green-200' : 'text-red-200'}`}>
                {isActive ? 'ACTIVE' : 'INACTIVE'}
              </div>
              <div className="text-xs opacity-80">Status</div>
            </div>
          </div>
        </div>

        {/* Interactive Controls */}
        {showControls && (
          <div className="relative z-10 mt-6 pt-4 border-t border-white/20">
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-card/10 text-xs py-2"
                onClick={() => copyToClipboard(membershipId, "Membership ID")}
              >
                <Copy className="h-3 w-3 mb-1" />
                <div>{copied ? "Copied!" : "Copy ID"}</div>
              </Button>

              <Dialog open={showQR} onOpenChange={setShowQR}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-card/10 text-xs py-2"
                  >
                    <Eye className="h-3 w-3 mb-1" />
                    <div>View QR</div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <QrCode className="h-5 w-5 mr-2" />
                      Membership QR Code
                    </DialogTitle>
                  </DialogHeader>
                  <div className="text-center p-6">
                    <div className="bg-card p-4 rounded-lg inline-block mb-4 shadow-lg">
                      {qrCode ? (
                        <img 
                          src={qrCode} 
                          alt="Large QR Code" 
                          className="w-48 h-48 mx-auto"
                        />
                      ) : (
                        <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
                          <QrCode className="h-16 w-16 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Show this QR code to vendors for instant verification
                    </p>
                    <div className="space-y-2">
                      <Button
                        onClick={() => copyToClipboard(membershipId, "Membership ID")}
                        className="w-full"
                        variant="outline"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Membership ID
                      </Button>
                      <Button
                        onClick={downloadCard}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Card
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-card/10 text-xs py-2"
                onClick={downloadCard}
              >
                <Download className="h-3 w-3 mb-1" />
                <div>Download</div>
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Instructions */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/20">
          <div className="flex items-start space-x-3 text-sm">
            <div className="flex-shrink-0">
              <div className="bg-card/10 p-2 rounded-full">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1">Present this digital card at participating stores</div>
              <div className="opacity-80 text-xs">to unlock exclusive member discounts and special offers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className={`${getCardBackground(membershipPlan)} px-6 py-4 border-t border-white/10`}>
        <div className="flex items-center justify-between text-xs text-white/80">
          <div className="flex items-center space-x-2">
            <Shield className="h-3 w-3" />
            <span>Secure Digital ID</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3" />
            <span>24/7 Access</span>
          </div>
          <div className="flex items-center space-x-2">
            {membershipPlan.toLowerCase() === 'premium' && <Crown className="h-3 w-3 text-purple-300" />}
            {membershipPlan.toLowerCase() === 'ultimate' && <Star className="h-3 w-3 text-yellow-300" />}
            {membershipPlan.toLowerCase() === 'basic' && <Shield className="h-3 w-3 text-blue-300" />}
            <span className="capitalize">{membershipPlan}</span>
          </div>
        </div>
        <div className="text-xs mt-2 text-white/60 text-center">
          Terms & Conditions apply • Valid only for active memberships • instoredealz.com
        </div>
      </div>
    </Card>
  );
}