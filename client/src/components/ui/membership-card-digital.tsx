import { generateMembershipQR } from "@/lib/qr-code";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import InstoredeelzLogo from "@/components/ui/instoredealz-logo";
import { User, Calendar, MapPin, QrCode } from "lucide-react";

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
}: MembershipCardProps) {
  const qrCode = generateMembershipQR(userId, membershipId);

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
          <div className="absolute inset-0 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-24 h-24 opacity-5">
          <div className="absolute inset-0 bg-white rounded-full transform -translate-x-12 translate-y-12"></div>
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
            <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm border-2 border-white/30">
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
            <div className="bg-white p-3 rounded-lg shadow-lg">
              <div 
                className="w-24 h-24 bg-center bg-no-repeat bg-contain"
                style={{ backgroundImage: `url("${qrCode}")` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/20">
          <div className="flex items-start space-x-2 text-sm">
            <QrCode className="h-4 w-4 mt-0.5 opacity-80 flex-shrink-0" />
            <div>
              <div className="font-medium mb-1">Scan this code at store</div>
              <div className="opacity-80">to redeem discounts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`${getCardBackground(membershipPlan)} px-6 py-3 text-xs ${getMembershipColor(membershipPlan)} opacity-90`}>
        *T&C apply. Only valid for active subscriptions.
      </div>
    </Card>
  );
}