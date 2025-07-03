import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PinInput } from "@/components/ui/pin-input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";

interface PinVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: number;
  dealTitle: string;
  onSuccess?: () => void;
}

export function PinVerificationDialog({
  open,
  onOpenChange,
  dealId,
  dealTitle,
  onSuccess
}: PinVerificationDialogProps) {
  const [pin, setPin] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const verifyPinMutation = useMutation({
    mutationFn: async (pin: string) => {
      const response = await apiRequest(`/api/deals/${dealId}/verify-pin`, 'POST', { pin });
      return response.json();
    },
    onSuccess: async (data: any) => {
      toast({
        title: "Deal Redeemed Successfully!",
        description: `You saved ₹${data.savingsAmount}! Total savings: ₹${data.newTotalSavings}`,
        variant: "default",
      });
      
      // Comprehensive data refresh to update user profile and deal information
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/deals"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/users/claims"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }),
        queryClient.invalidateQueries({ queryKey: [`/api/deals/${dealId}`] }),
        queryClient.invalidateQueries({ queryKey: [`/api/deals/${dealId}/secure`] }),
        queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] }),
      ]);
      
      // Force refetch user data to update dashboard statistics
      queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });
      
      onSuccess?.();
      onOpenChange(false);
      setPin("");
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid PIN. Please check with the vendor.",
        variant: "destructive",
      });
    },
  });

  const handleVerify = () => {
    if (pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 4-digit PIN",
        variant: "destructive",
      });
      return;
    }
    verifyPinMutation.mutate(pin);
  };

  const handleClose = () => {
    onOpenChange(false);
    setPin("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Verify Deal PIN
          </DialogTitle>
          <DialogDescription>
            Enter the 4-digit PIN provided by the vendor for{" "}
            <span className="font-semibold">"{dealTitle}"</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Ask the vendor for their verification PIN to complete your redemption
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Enter 4-digit PIN
              </label>
              <PinInput
                value={pin}
                onChange={setPin}
                onComplete={handleVerify}
                disabled={verifyPinMutation.isPending}
                className="justify-center"
              />
            </div>

            {pin.length === 4 && !verifyPinMutation.isPending && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">PIN entered, ready to verify</span>
              </div>
            )}

            {verifyPinMutation.isPending && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                <span className="text-sm">Verifying PIN...</span>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 w-full">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Offline Friendly</p>
                <p className="text-xs">
                  This verification works without internet. The vendor can share their PIN even when offline.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={verifyPinMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleVerify} 
            disabled={pin.length !== 4 || verifyPinMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {verifyPinMutation.isPending ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Verify & Redeem
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}