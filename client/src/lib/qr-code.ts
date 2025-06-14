// Simple QR code generator using canvas
export const generateQRCode = (text: string, size: number = 200): string => {
  // This is a simplified QR code generator for demo purposes
  // In production, use a proper QR code library like qrcode.js
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  canvas.width = size;
  canvas.height = size;
  
  // Create a simple pattern based on text hash
  const hash = hashCode(text);
  const cellSize = size / 21; // 21x21 grid like real QR codes
  
  // Fill background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);
  
  // Draw pattern
  ctx.fillStyle = '#000000';
  
  // Draw finder patterns (corners)
  drawFinderPattern(ctx, 0, 0, cellSize);
  drawFinderPattern(ctx, 14 * cellSize, 0, cellSize);
  drawFinderPattern(ctx, 0, 14 * cellSize, cellSize);
  
  // Draw data pattern based on hash
  for (let i = 0; i < 21; i++) {
    for (let j = 0; j < 21; j++) {
      // Skip finder patterns
      if (isFinderPattern(i, j)) continue;
      
      // Generate pseudo-random pattern based on hash and position
      const seed = hash + i * 21 + j;
      if (seed % 3 === 0) {
        ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }
  
  return canvas.toDataURL();
};

const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

const drawFinderPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number) => {
  // Draw outer 7x7 square
  ctx.fillRect(x, y, 7 * cellSize, 7 * cellSize);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize);
  ctx.fillStyle = '#000000';
  ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize);
};

const isFinderPattern = (i: number, j: number): boolean => {
  // Check if position is within finder patterns
  return (i < 7 && j < 7) || // Top-left
         (i > 13 && j < 7) || // Top-right
         (i < 7 && j > 13);   // Bottom-left
};

// Generate QR code for membership card
export const generateMembershipQR = (userId: number, membershipId: string): string => {
  const qrData = JSON.stringify({
    userId,
    membershipId,
    platform: 'instoredealz',
    timestamp: Date.now(),
  });
  
  return generateQRCode(qrData);
};

// Generate QR code for deal
export const generateDealQR = (dealId: number, userId: number): string => {
  const qrData = JSON.stringify({
    dealId,
    userId,
    type: 'deal_claim',
    timestamp: Date.now(),
  });
  
  return generateQRCode(qrData);
};
