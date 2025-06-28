import QRCode from 'qrcode';

export interface QRCodeOptions {
  text: string;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface QRCodeTheme {
  name: string;
  backgroundColor: string;
  foregroundColor: string;
  description: string;
}

// Pre-defined magical themes for different types of QR codes
export const QR_THEMES: Record<string, QRCodeTheme> = {
  success: {
    name: 'Success Magic',
    backgroundColor: '#dcfce7',
    foregroundColor: '#166534',
    description: 'Green magical theme for successful actions'
  },
  warning: {
    name: 'Warning Magic',
    backgroundColor: '#fef3c7',
    foregroundColor: '#d97706',
    description: 'Orange magical theme for warnings and alerts'
  },
  premium: {
    name: 'Premium Magic',
    backgroundColor: '#fdf4ff',
    foregroundColor: '#7c3aed',
    description: 'Purple magical theme for premium features'
  },
  deal: {
    name: 'Deal Magic',
    backgroundColor: '#f0fdf4',
    foregroundColor: '#15803d',
    description: 'Fresh green theme for deals and savings'
  },
  membership: {
    name: 'Membership Magic',
    backgroundColor: '#fef3c7',
    foregroundColor: '#d97706',
    description: 'Golden theme for membership verification'
  },
  classic: {
    name: 'Classic Magic',
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    description: 'Traditional black and white theme'
  }
};

/**
 * Generates a magical QR code picture from text using customizable options
 * @param options - Configuration options for the QR code generation
 * @returns Promise<string> - Data URL of the generated QR code image
 */
export const generateQRCode = async (options: QRCodeOptions): Promise<string> => {
  const { 
    text, 
    size = 250, 
    backgroundColor = '#ffffff', 
    foregroundColor = '#000000',
    margin = 2,
    errorCorrectionLevel = 'M'
  } = options;
  
  // Validate input text
  if (!text || text.trim().length === 0) {
    throw new Error('Text is required to generate QR code');
  }
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      width: size,
      margin,
      errorCorrectionLevel,
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      }
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating magical QR code:', error);
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generates a QR code using a predefined magical theme
 * @param text - The text to encode in the QR code
 * @param themeName - The name of the theme to use
 * @param size - Optional size override for the QR code
 * @returns Promise<string> - Data URL of the generated QR code image
 */
export const generateThemedQRCode = async (
  text: string, 
  themeName: keyof typeof QR_THEMES, 
  size?: number
): Promise<string> => {
  const theme = QR_THEMES[themeName];
  
  if (!theme) {
    throw new Error(`Unknown QR code theme: ${themeName}. Available themes: ${Object.keys(QR_THEMES).join(', ')}`);
  }
  
  return generateQRCode({
    text,
    size: size || 250,
    backgroundColor: theme.backgroundColor,
    foregroundColor: theme.foregroundColor,
    errorCorrectionLevel: 'M',
    margin: 3
  });
};

/**
 * Generates a magical QR code for deal claims with special styling
 * @param dealId - The ID of the claimed deal
 * @param claimId - The unique claim identifier
 * @param dealTitle - Optional deal title for enhanced data
 * @returns Promise<string> - Data URL of the deal claim QR code
 */
export const generateDealClaimQR = async (
  dealId: number, 
  claimId: number, 
  dealTitle?: string
): Promise<string> => {
  const claimData = {
    dealId,
    claimId,
    timestamp: Date.now(),
    type: 'deal_claim',
    dealTitle: dealTitle || `Deal #${dealId}`,
    version: '1.0'
  };
  
  const qrText = JSON.stringify(claimData);
  
  return generateThemedQRCode(qrText, 'deal', 320);
};

/**
 * Generates a magical QR code for membership verification
 * @param userId - The user's unique identifier
 * @param membershipPlan - The membership plan type
 * @param userEmail - Optional user email for verification
 * @returns Promise<string> - Data URL of the membership QR code
 */
export const generateMembershipQR = async (
  userId: number, 
  membershipPlan: string, 
  userEmail?: string
): Promise<string> => {
  const membershipData = {
    userId,
    membershipPlan,
    timestamp: Date.now(),
    type: 'membership_verification',
    email: userEmail,
    version: '1.0'
  };
  
  const qrText = JSON.stringify(membershipData);
  
  return generateThemedQRCode(qrText, 'membership', 280);
};

/**
 * Generates a magical QR code for vendor verification
 * @param vendorId - The vendor's unique identifier
 * @param vendorName - The vendor's business name
 * @returns Promise<string> - Data URL of the vendor verification QR code
 */
export const generateVendorQR = async (vendorId: number, vendorName: string): Promise<string> => {
  const vendorData = {
    vendorId,
    vendorName,
    timestamp: Date.now(),
    type: 'vendor_verification',
    version: '1.0'
  };
  
  const qrText = JSON.stringify(vendorData);
  
  return generateThemedQRCode(qrText, 'premium', 300);
};

/**
 * Generates a magical QR code for payment transactions
 * @param amount - Transaction amount
 * @param transactionId - Unique transaction identifier
 * @param description - Transaction description
 * @returns Promise<string> - Data URL of the payment QR code
 */
export const generatePaymentQR = async (
  amount: number, 
  transactionId: string, 
  description: string
): Promise<string> => {
  const paymentData = {
    amount,
    transactionId,
    description,
    timestamp: Date.now(),
    type: 'payment',
    currency: 'INR',
    version: '1.0'
  };
  
  const qrText = JSON.stringify(paymentData);
  
  return generateThemedQRCode(qrText, 'success', 350);
};

/**
 * Generates a simple magical QR code from any text with automatic theme selection
 * @param text - The text to encode
 * @param type - The type of QR code for theme selection
 * @param size - Optional size override
 * @returns Promise<string> - Data URL of the generated QR code
 */
export const generateMagicQR = async (
  text: string, 
  type: 'success' | 'warning' | 'premium' | 'deal' | 'membership' | 'classic' = 'classic',
  size?: number
): Promise<string> => {
  return generateThemedQRCode(text, type, size);
};