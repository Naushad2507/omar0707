import QRCode from 'qrcode';

export interface QRCodeOptions {
  text: string;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
}

export const generateQRCode = async (options: QRCodeOptions): Promise<string> => {
  const { text, size = 200, backgroundColor = '#ffffff', foregroundColor = '#000000' } = options;
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const generateDealClaimQR = async (dealId: number, claimId: number): Promise<string> => {
  const claimData = {
    dealId,
    claimId,
    timestamp: Date.now(),
    type: 'deal_claim'
  };
  
  const qrText = JSON.stringify(claimData);
  
  return generateQRCode({
    text: qrText,
    size: 300,
    backgroundColor: '#f0fdf4', // Light green background
    foregroundColor: '#15803d', // Dark green foreground
  });
};

export const generateMembershipQR = async (userId: number, membershipPlan: string): Promise<string> => {
  const membershipData = {
    userId,
    membershipPlan,
    timestamp: Date.now(),
    type: 'membership_verification'
  };
  
  const qrText = JSON.stringify(membershipData);
  
  return generateQRCode({
    text: qrText,
    size: 250,
    backgroundColor: '#fef3c7', // Light yellow background
    foregroundColor: '#d97706', // Orange foreground
  });
};