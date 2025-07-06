import { QrCode } from "lucide-react";
import { generateMembershipQR } from "@/lib/qr-code";
import { useEffect, useState } from "react";

interface MembershipCardProps {
  userName: string;
  membershipId: string;
  membershipPlan: string;
  expiryDate?: string;
  totalSavings: string;
  isPromotionalUser?: boolean;
  userId: number;
}

export default function MembershipCard({
  userName,
  membershipId,
  membershipPlan,
  expiryDate,
  totalSavings,
  isPromotionalUser,
  userId,
}: MembershipCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const qrCode = generateMembershipQR(userId, membershipId);
    setQrCodeUrl(qrCode);
  }, [userId, membershipId]);

  const getPlanColor = (plan: string | null | undefined) => {
    if (!plan) return "bg-gradient-to-br from-gray-600 to-gray-700";
    
    switch (plan.toLowerCase()) {
      case "premium":
        return "membership-card"; // Uses CSS class with gradient
      case "ultimate":
        return "bg-gradient-to-br from-royal to-purple-600";
      default:
        return "bg-gradient-to-br from-gray-600 to-gray-700";
    }
  };

  const formatSavings = (savings: string) => {
    const amount = parseFloat(savings);
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toFixed(0)}`;
  };

  return (
    <div className={`${getPlanColor(membershipPlan)} rounded-2xl text-white p-6 relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="w-full h-full bg-card rounded-full transform translate-x-16 -translate-y-16" />
      </div>
      <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10">
        <div className="w-full h-full bg-card rounded-full transform -translate-x-12 translate-y-12" />
      </div>

      {/* Card Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-xl font-bold capitalize">
            {membershipPlan} Member
          </h3>
          {isPromotionalUser && (
            <div className="bg-success text-white text-xs px-2 py-1 rounded-full mt-1 inline-block">
              🎉 Promotional Plan
            </div>
          )}
          <p className="text-blue-100 mt-2">{userName}</p>
          <p className="text-blue-100 text-sm">ID: {membershipId}</p>
        </div>
        <div className="bg-card p-2 rounded">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16" />
          ) : (
            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
              <QrCode className="h-8 w-8 text-gray-500" />
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="border-t border-blue-300 pt-4 relative z-10">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-100">
              {expiryDate ? `Valid until: ${new Date(expiryDate).toLocaleDateString('en-IN')}` : "Lifetime validity"}
            </p>
            <p className="text-sm text-blue-100">
              Total Savings: {formatSavings(totalSavings)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatSavings(totalSavings)}</div>
            <div className="text-xs text-blue-100">Saved</div>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      {isPromotionalUser && expiryDate && (
        <div className="absolute top-2 left-2 right-2 bg-success/20 backdrop-blur-sm rounded-lg p-2 border border-success/30">
          <p className="text-xs text-center font-medium">
            Free Premium Plan until {new Date(expiryDate).toLocaleDateString('en-IN')}
          </p>
        </div>
      )}
    </div>
  );
}
